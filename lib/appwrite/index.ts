export {
  account,
  databases,
  storage,
  functions,
  appwriteClient,
  ID,
  Query,
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
  BUCKETS,
  FUNCTIONS,
} from "./config";

export type { ResumeDocument, UserDocument } from "./config";

export { useAppwriteAuth, useResumeStorage } from "./hooks";
