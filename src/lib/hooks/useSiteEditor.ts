// hooks/useSiteEditor.ts

"use client";

import { useCallback, useState } from "react";

interface EditData {
	section: string;
	editType: "text" | "color" | "layout";
	newContent: string;
	oldContent?: string;
}

interface UseSiteEditorReturn {
	editing: boolean;
	saving: boolean;
	error: string | null;
	editSite: (siteId: string, editData: EditData) => Promise<boolean>;
	fetchEdits: (siteId: string) => Promise<any[]>;
}

export function useSiteEditor(): UseSiteEditorReturn {
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const editSite = useCallback(
		async (siteId: string, editData: EditData): Promise<boolean> => {
			setSaving(true);
			setError(null);

			try {
				const response = await fetch("/api/st/edit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						siteId,
						section: editData.section,
						editType: editData.editType,
						newContent: editData.newContent,
						oldContent: editData.oldContent,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to save edit");
				}

				const data = await response.json();
				return data.success;
			} catch (err: any) {
				setError(err.message || "An error occurred");
				console.error("Edit error:", err);
				return false;
			} finally {
				setSaving(false);
			}
		},
		[],
	);

	const fetchEdits = useCallback(async (siteId: string): Promise<any[]> => {
		try {
			const response = await fetch(`/api/st/edit?siteId=${siteId}`);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch edits");
			}
			const data = await response.json();
			return data.edits || [];
		} catch (err: any) {
			setError(err.message || "An error occurred");
			console.error("Fetch edits error:", err);
			return [];
		}
	}, []);

	return {
		editing,
		saving,
		error,
		editSite,
		fetchEdits,
	};
}
