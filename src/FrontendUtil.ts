export async function downloadFile(fileUrlIn: string, fileNameIn: string): Promise<true | Error> {
  const res = await fetch(fileUrlIn);
  if (!res.ok) {
    return new Error(`Something went wrong while downloading file at ${fileUrlIn}, status code: ${res.status} :: ${res.statusText}`);
  }

  const blobIn = await res.blob();
  const fakeLink = document.createElement("a");
  fakeLink.href = URL.createObjectURL(blobIn);
  fakeLink.download = fileNameIn;
  fakeLink.click();

  URL.revokeObjectURL(fakeLink.href);

  return true;
}
