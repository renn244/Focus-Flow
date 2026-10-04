import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUploadAvatarMutation } from "@/features/settings/hooks/useUpdateProfileMutation";
import { Camera, Loader2 } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { toast } from "sonner";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

type AvatarUploadProps = {
  avatarUrl?: string;
  displayName: string;
  username: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AvatarUpload = ({
  avatarUrl,
  displayName,
  username,
}: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatarMutation();

  const uploadSelectedAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > MAX_AVATAR_SIZE_BYTES
    ) {
      toast.error("Choose a JPG, PNG, or WebP image smaller than 2 MB.");
      return;
    }

    uploadAvatar.mutate(file);
  };

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="size-20 border border-slate-200">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-blue-50 text-lg font-semibold text-blue-700">
          {initials(displayName || username)}
        </AvatarFallback>
      </Avatar>
      <div>
        <Button
          variant="outline"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadAvatar.isPending}
        >
          {uploadAvatar.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
          Change photo
        </Button>
        <p className="mt-2 text-xs text-slate-500">
          JPG, PNG, or WebP - up to 2 MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={uploadSelectedAvatar}
          className="sr-only"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
