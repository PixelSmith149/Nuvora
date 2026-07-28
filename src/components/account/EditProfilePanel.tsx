"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePanel() {
	const supabase = createClient();
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState("");
	const [bio, setBio] = useState("");

	useEffect(() => {
		async function loadProfile() {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) return;

			const { data } = await supabase
				.from("profiles")
				.select("username,bio")
				.eq("id", user.id)
				.single();

			if (data) {
				setUsername(data.username || "");
				setBio(data.bio || "");
			}
		}

		loadProfile();
	}, []);

	async function saveProfile() {
		try {
			setLoading(true);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) return;

			const { error } = await supabase
				.from("profiles")
				.update({
					username,
					bio,
				})
				.eq("id", user.id);

			if (error) throw error;

			alert("Profile updated");
		} catch (err: any) {
			alert(err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="p-6 rounded-2xl border border-zinc-800 space-y-4">
			<h2 className="font-semibold">Edit Profile</h2>

			<input
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
				className="w-full p-3 rounded-lg bg-black/30 border border-zinc-800"
			/>

			<textarea
				value={bio}
				onChange={(e) => setBio(e.target.value)}
				placeholder="Bio"
				className="w-full p-3 rounded-lg bg-black/30 border border-zinc-800"
			/>

			<button
				onClick={saveProfile}
				disabled={loading}
				className="px-4 py-2 rounded-lg bg-white text-black"
			>
				{loading ? "Saving..." : "Save Changes"}
			</button>
		</div>
	);
}
