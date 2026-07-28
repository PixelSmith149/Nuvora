"use client";

import { useCallback, useEffect, useRef } from "react";
import { useBuilder } from "@/components/templates/builder/core/BuilderProvider";

interface UseAutoSaveOptions {
	delay?: number;
	onSave: () => Promise<void>;
	onError?: (err: Error) => void;
}

export function useAutoSave({
	delay = 3000,
	onSave,
	onError,
}: UseAutoSaveOptions) {
	const { isDirty, setIsDirty } = useBuilder();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isSavingRef = useRef(false);

	const save = useCallback(async () => {
		if (isSavingRef.current) return;
		if (!isDirty) return;

		isSavingRef.current = true;

		try {
			await onSave();
			setIsDirty(false);
		} catch (err) {
			if (onError) {
				onError(err as Error);
			}
		} finally {
			isSavingRef.current = false;
		}
	}, [isDirty, onSave, onError, setIsDirty]);

	useEffect(() => {
		if (!isDirty) return;

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			save();
		}, delay);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [isDirty, save, delay]);

	return { save, isSaving: isSavingRef.current };
}
