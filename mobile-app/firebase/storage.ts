import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase"; // 👈 reuse existing app

const storage = getStorage(app);

export async function uploadIssueImage(
  uri: string,
  issueId: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const imageRef = ref(storage, `issues/${issueId}.jpg`);
  await uploadBytes(imageRef, blob);

  return await getDownloadURL(imageRef);
}
