"use client";

import { useEffect, useRef } from "react";
import grapesjs, { type Editor } from "grapesjs";
import presetNewsletter from "grapesjs-preset-newsletter";
import "grapesjs/dist/css/grapes.min.css";
import { TEMPLATE_VARIABLES } from "../../constants";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

function getAuthToken(): string | null {
  try {
    return JSON.parse(localStorage.getItem("auth") ?? "{}").token ?? null;
  } catch {
    return null;
  }
}

interface Props {
  initialProjectData?: string;
  initialHtml?: string;
  onInit: (editor: Editor) => void;
}

export default function EmailTemplateEditor({
  initialProjectData,
  initialHtml,
  onInit,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onInitRef = useRef(onInit);
  onInitRef.current = onInit;

  useEffect(() => {
    if (!containerRef.current) return;

    const editorHolder: { current: Editor | null } = { current: null };

    const editor = grapesjs.init({
      container: containerRef.current,
      height: "70vh",
      storageManager: false,
      plugins: [presetNewsletter],
      assetManager: {
        uploadFile: async (e: DragEvent) => {
          const files =
            e.dataTransfer?.files ??
            (e.target as HTMLInputElement | null)?.files;
          if (!files || files.length === 0) return;

          const form = new FormData();
          form.append("file", files[0]);
          const token = getAuthToken();

          try {
            const res = await fetch(`${API_BASE}/email/templates/image`, {
              method: "POST",
              body: form,
              credentials: "include",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const body = await res.json();
            if (res.ok && body?.data?.url) {
              editorHolder.current?.AssetManager.add(body.data.url);
            } else {
              alert(body?.error ?? "อัปโหลดรูปไม่สำเร็จ");
            }
          } catch {
            alert("อัปโหลดรูปไม่สำเร็จ");
          }
        },
      },
    });
    editorHolder.current = editor;

    TEMPLATE_VARIABLES.forEach((v) => {
      editor.BlockManager.add(`var-${v.token}`, {
        label: v.label,
        category: "ตัวแปร",
        content: { type: "text", content: v.token },
      });
    });

    if (initialProjectData) {
      try {
        editor.loadProjectData(JSON.parse(initialProjectData));
      } catch {
        if (initialHtml) editor.setComponents(initialHtml);
      }
    } else if (initialHtml) {
      editor.setComponents(initialHtml);
    }

    onInitRef.current(editor);

    return () => {
      editor.destroy();
    };
  }, [initialProjectData, initialHtml]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div ref={containerRef} />
    </div>
  );
}
