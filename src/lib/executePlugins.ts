import { map } from 'lodash';

import { Template, TemplatePluginConfig } from '../interfaces/template';
import { evaluateOption } from './evaluateOption';
import { execNullable } from './utils';

/**
 * Returns a function which executes a plugin
 * based on the configuration and answers
 * @param answers All provided answers
 * @param template The overall template
 */
export const executePlugin = <Answers>(
  answers: Answers,
  template: Template<Answers>
) =>
  /**
   * Executes a plugin based on the configuration and answers
   * @param plugin A plugin configuration
   */
  async <PluginType>({
    name,
    config
  }: TemplatePluginConfig<Answers, PluginType>) => {
    try {
      const { hooks = {} } = template;
      const { preplugin, postplugin } = hooks;
      const evaluate = evaluateOption(answers, template);
      // preplugin hook
      const execPreplugin = execNullable(preplugin);
      await execPreplugin(name, answers, template);
      const contentsValue = await evaluate(config);
      // postplugin hook
      const execPostplugin = execNullable(postplugin);
      await execPostplugin(name, contentsValue, answers, template);
    } catch (error) {
      throw error;
    }
  };

/**
 * Executes plugins based on the configuration and answers
 * @param template The overall template
 * @param answers All provided answers
 */
export const executePlugins = async <Answers>(
  answers: Answers,
  template: Template<Answers>
) => {
  try {
    const { hooks = {}, plugins = [] } = template;
    const { preplugins, postplugins } = hooks;
    // preplugins hook
    const execPreplugins = execNullable(preplugins);
    await execPreplugins(answers, template);
    const execute = executePlugin(answers, template);
    await Promise.all(map(plugins, execute));
    // postplugins hook
    const execPostplugins = execNullable(postplugins);
    await execPostplugins(answers, template);
  } catch (error) {
    throw error;
  }
};
