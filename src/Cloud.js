export const CLOUD_NAME = "dxvyf6vl7";
export const UPLOAD_PRESET = "unsigned_preset";
export async function uploadPhoto(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error(xhr.responseText));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export async function fetchImages(folder = "_root") {
  const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${folder}.json`);
  if (!response.ok) throw new Error("Failed to fetch images");
  const data = await response.json();
  return data.resources;
}
