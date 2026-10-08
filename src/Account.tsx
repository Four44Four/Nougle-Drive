import { useState, useEffect, useRef, Dispatch, SetStateAction, JSX } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "./types/supabase";
import { type Page } from "./App";
import Activate2fa from "./Activate2fa";
import * as BEUtil from "./BackendUtil";
import { type StorageFile } from "./BackendUtil";
import { downloadFile } from "./FrontendUtil";

type PageProps = {
  supabaseClient: SupabaseClient<Database>;
  setCurPage: Dispatch<SetStateAction<Page>>;
  curAccountId: string;
  curUsername: string;
  wasEnrolled: boolean;
  setWasEnrolled: Dispatch<SetStateAction<boolean>>;
};

const TEXT_LINES_LIMIT = 10;

function FilePreview({ fileUrlIn }: { fileUrlIn: string | null; }): JSX.Element {
  if (fileUrlIn === null) {
    return <p>Invalid link :(</p>;
  }

  const [textContent, setTextContent] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  // if it is `true`, then this component has loaded successfully
  const [statusText, setStatusText] = useState<string | true>("Loading...");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(fileUrlIn);
        if (!isMounted) {
          return;
        }

        const contentType = (res.headers.get("content-type") || "").toLowerCase();

        setMimeType(contentType);
        if (contentType.startsWith("text/") || contentType.includes("json") || contentType.includes("javascript")) {
          const curTextContent = await res.text();
          if (!isMounted) {
            return;
          }

          const curTextLines = curTextContent.split(/\r?\n/);
          const curTextLinesTruncated = curTextLines.slice(0, TEXT_LINES_LIMIT).join("\n");
          setTextContent(curTextLines.length > TEXT_LINES_LIMIT
                           ? curTextLinesTruncated + "\n\n..."
                           : curTextLinesTruncated);
        }

        setStatusText(true);
      } catch (errorIn: any) {
        if (errorIn.name !== "AbortError") {
          setStatusText(`Error: ${errorIn.message}`);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [fileUrlIn]);

  if (statusText !== true) {
    return <p>statusText</p>;
  }
  else if (mimeType.startsWith("image/")) {
    return <img src={fileUrlIn} />;
  }
  else if (mimeType.startsWith("video/")) {
    return <video controls muted src={fileUrlIn}/>;
  }
  else if (textContent.length > 0) {
    return <pre>{textContent}</pre>;
  }
  else {
    return <p>No preview :(</p>;
  }
}

export default function ({ supabaseClient, setCurPage, curAccountId, curUsername, wasEnrolled, setWasEnrolled }: PageProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      if (wasEnrolled
            && (await BEUtil.isClientMFAVerified(supabaseClient)) instanceof Error) {
        await BEUtil.signOutUser(supabaseClient);
        setCurPage("login");
      }

      const readAllRes = await BEUtil.readAllFiles(supabaseClient, curAccountId);
      if (readAllRes instanceof Error) {
        alert(readAllRes.message);
      } else {
        setFiles(readAllRes);
      }
    })();
  }, []);

  const onSignOut = async () => {
    const signOutRes = await BEUtil.signOutUser(supabaseClient);
    if (signOutRes instanceof Error) {
      alert(signOutRes.message);
    } else {
      alert("Signed out successfully");
      window.location.reload();
    }
  }

  const onEnroll2FA = () => {
    setCurPage("activate2fa");
  }

  const onUnenroll2FA = async () => {
    const unenrollRes = await BEUtil.unenrollUserTOTPMFA(supabaseClient);

    if (unenrollRes instanceof Error) {
      alert(`Backend error: ${JSON.stringify(unenrollRes)}`);
    } else {
      setWasEnrolled(false);
      alert("Successfully unenrolled from MFA");
    }
  }

  const onDelete = async (fileNameIn: string) => {
    const deleteRes = await BEUtil.deleteFile(supabaseClient, curAccountId, fileNameIn);
    if (deleteRes instanceof Error) {
      alert(deleteRes.message);
    } else {
      setFiles(oldFiles => oldFiles.filter(curFile => curFile.fileName !== fileNameIn));
      alert("Delete successful");
    }
  }

  const onAdd = async () => {
    if (uploadFileInputRef.current === null) {
      return;
    }

    if (!uploadFileInputRef.current.files
        || uploadFileInputRef.current.files.length === 0
        || !uploadFileInputRef.current.files[0]) {
      alert("Select a file before uploading")
      return;
    }

    const createRes = await BEUtil.uploadFile(supabaseClient, curAccountId, uploadFileInputRef.current.files[0]);
    if (createRes instanceof Error) {
      alert(createRes.message);
    } else {
      setFiles(oldFiles => [createRes, ...oldFiles])
      uploadFileInputRef.current.value = "";
      alert("Create successful");
    }
  }

  return (
    <div>
      <h1>ACCOUNT: {curUsername}</h1>
      {wasEnrolled && (
        <button onClick={onUnenroll2FA}>
          *Unenroll* from 2FA
        </button>
      )}
      {!wasEnrolled && (
        <button onClick={onEnroll2FA}>
          Enroll for 2FA
        </button>
      )}
      <button onClick={onSignOut}>
        Sign out
      </button>

      <br />

      <input ref={uploadFileInputRef} type="file" />
      <button onClick={onAdd}>
        Upload new File
      </button>

      <br />

      {files.map((curFile: StorageFile) => (
        <div key={curFile.fileName}>
          <b>{curFile.fileName}</b>
          <button onClick={() => {downloadFile(curFile.fileSignedUrl ?? "", curFile.fileName)}}>
            Download
          </button>
          <br/>
          <FilePreview fileUrlIn={curFile.fileSignedUrl} />
          <button onClick={async () => {await onDelete(curFile.fileName);}}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
