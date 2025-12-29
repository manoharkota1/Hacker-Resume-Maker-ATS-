import { Client, Databases, Functions } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

let singleton: {
  client: Client;
  databases: Databases;
  functions: Functions;
} | null = null;

export function getAppwrite() {
  if (!endpoint || !project) {
    throw new Error("Appwrite env vars not configured");
  }

  if (singleton) return singleton;

  const client = new Client().setEndpoint(endpoint).setProject(project);
  const databases = new Databases(client);
  const functions = new Functions(client);

  singleton = { client, databases, functions };
  return singleton;
}
