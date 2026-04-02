import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { ragConfig } from '~/shared/config/rag';

export const createRagTextSplitter = () => {
  return new RecursiveCharacterTextSplitter({
    chunkSize: ragConfig.chunkSize,
    chunkOverlap: ragConfig.chunkOverlap
  });
};
