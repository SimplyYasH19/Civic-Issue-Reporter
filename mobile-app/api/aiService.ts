import axios from "axios";

const API_URL = "http://192.168.1.7:8000/upload-image/";

export async function sendImageToAI(imageUri: string) {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "issue.jpg",
    type: "image/jpeg",
  } as any);

  const response = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 15000,
  });

  return response.data;
}
