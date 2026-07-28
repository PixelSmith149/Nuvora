"use client";

import { useCallback, useState } from "react";
import { useBuilder } from "@/components/templates/builder/core/BuilderProvider";

interface ValidationErrors {
	name?: string;
	html?: string;
	category?: string;
}

export function useTemplateValidation() {
	const { name, htmlCode, category } = useBuilder();
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isValid, setIsValid] = useState(true);

	const validate = useCallback(() => {
		const newErrors: ValidationErrors = {};
		let valid = true;

		if (!name.trim()) {
			newErrors.name = "Template name is required";
			valid = false;
		}

		if (!htmlCode.trim()) {
			newErrors.html = "HTML content is required";
			valid = false;
		}

		if (!category) {
			newErrors.category = "Category is required";
			valid = false;
		}

		// ─── HTML validation ─────────────────────────────────────────────
		if (htmlCode.trim()) {
			// Check for unclosed tags
			const openTags =
				htmlCode.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>/g) || [];
			const closeTags = htmlCode.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [];

			const openTagNames = openTags
				.map((tag) => {
					const match = tag.match(/<([a-zA-Z][a-zA-Z0-9]*)/);
					return match ? match[1] : "";
				})
				.filter(Boolean);

			const closeTagNames = closeTags
				.map((tag) => {
					const match = tag.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/);
					return match ? match[1] : "";
				})
				.filter(Boolean);

			// Check if all tags are closed
			const unclosed = openTagNames.filter((tag) => {
				const openCount = openTagNames.filter((t) => t === tag).length;
				const closeCount = closeTagNames.filter((t) => t === tag).length;
				return openCount > closeCount;
			});

			if (unclosed.length > 0) {
				newErrors.html = `Unclosed tags: ${unclosed.join(", ")}`;
				valid = false;
			}
		}

		setErrors(newErrors);
		setIsValid(valid);
		return { valid, errors: newErrors };
	}, [name, htmlCode, category]);

	const clearErrors = useCallback(() => {
		setErrors({});
		setIsValid(true);
	}, []);

	return { errors, isValid, validate, clearErrors };
}
