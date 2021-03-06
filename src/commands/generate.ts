import { isNil } from 'lodash';

import { Template } from '../interfaces/template';
import { executePlugins } from '../lib/executePlugins';
import { generateFiles } from '../lib/generateFiles';
import { handleError } from '../lib/handleError';
import { promptQuestions } from '../lib/promptQuestions';
import { execConditional } from '../lib/utils';

/**
 * Non-interactive, accepts answers and generates package
 * @param template The loaded template
 * @param answers All provided answers
 */
export const generate = async <Answers>(
  answers: Answers,
  template: Template<Answers>
) => {
  try {
    const { files, plugins } = template;
    const execGenerateFiles = execConditional(!isNil(files), generateFiles);
    await execGenerateFiles(answers, template);
    const execExecutePlugins = execConditional(!isNil(plugins), executePlugins);
    await execExecutePlugins(answers, template);
  } catch (error) {
    await handleError(error, answers, template);
    throw error;
  }
};

/**
 * Prompts for answers, then generates package
 * @param template The loaded template
 */
export const generateInteractive = async <Answers>(
  template: Template<Answers>
) => {
  try {
    const answers = await promptQuestions(template);
    return await generate(answers, template);
  } catch (error) {
    throw error;
  }
};
