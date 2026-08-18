import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/ui/BackButton";
import { AppSession, useSessionUser } from "../../lib/session";

/** Ported from ProfileEditView.swift — editable user fields + photo picker. */
export function ProfileEditScreen() {
  const navigate = useNavigate();
  const user = useSessionUser();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [nidaNumber, setNidaNumber] = useState("");
  const [driversLicense, setDriversLicense] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setPhoneNumber(user.phoneNumber);
    setEmail(user.email);
    setUsername(user.handle);
    setNidaNumber(user.nidaNumber);
    setDriversLicense(user.driversLicense);
    setPhotoDataUrl(user.photoDataUrl);
    // Load current user into local editable state once on mount only —
    // this screen owns the fields while open, matching native's onAppear-once guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!user) return;
    AppSession.user.set({
      ...user,
      fullName,
      phoneNumber,
      email,
      handle: username,
      nidaNumber,
      driversLicense,
      photoDataUrl,
    });
    navigate(-1);
  }

  function handleDeleteAccount() {
    AppSession.logout();
    navigate("/signup", { replace: true });
  }

  return (
    <div className="flex h-full min-h-dvh flex-col bg-background px-5 pb-10 pt-5">
      <div className="relative flex items-center justify-center pb-5">
        <div className="absolute left-0">
          <BackButton onClick={() => navigate(-1)} />
        </div>
        <p className="text-lg font-bold text-text-primary">Edit Profile</p>
      </div>

      <div className="flex justify-center pb-7">
        <label className="relative flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-brand-yellow/20">
          {photoDataUrl ? (
            <img src={photoDataUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="text-4xl font-bold" style={{ color: "var(--color-brand-yellow)" }}>
              {fullName?.[0] ?? "?"}
            </span>
          )}
          <span
            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--color-brand-red)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-brand-yellow)" aria-hidden="true">
              <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 6a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
            </svg>
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </label>
      </div>

      <SectionLabel text="CUSTOMER DETAILS" />
      <div className="mb-6 flex flex-col rounded-2xl" style={{ backgroundColor: "var(--color-brand-red)" }}>
        <EditableRow label="Full Name" value={fullName} onChange={setFullName} />
        <RowDivider />
        <EditableRow label="Phone number" value={phoneNumber} onChange={setPhoneNumber} type="tel" />
        <RowDivider />
        <EditableRow label="Email" value={email} onChange={setEmail} type="email" />
        <RowDivider />
        <EditableRow label="Username" value={username} onChange={setUsername} />
      </div>

      <SectionLabel text="KYC INFORMATION" />
      <div className="mb-8 flex flex-col rounded-2xl" style={{ backgroundColor: "var(--color-brand-red)" }}>
        <EditableRow label="NIDA Number" value={nidaNumber} onChange={setNidaNumber} />
        <RowDivider />
        <EditableRow label="Driver's License" value={driversLicense} onChange={setDriversLicense} placeholder="-" />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mb-3 rounded-2xl py-4 font-bold"
        style={{ backgroundColor: "var(--color-brand-yellow)", color: "var(--color-brand-red)" }}
      >
        Save Changes
      </button>
      <button
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        className="rounded-2xl py-4 font-bold text-white"
        style={{ backgroundColor: "var(--color-brand-red)" }}
      >
        Delete Account
      </button>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-10" onClick={() => setShowDeleteConfirm(false)}>
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold text-text-primary">Delete your account?</p>
            <p className="text-sm text-text-secondary">This can't be undone.</p>
            <button type="button" onClick={handleDeleteAccount} className="mt-1 rounded-full py-3 font-bold text-white" style={{ backgroundColor: "var(--color-brand-red)" }}>
              Delete Account
            </button>
            <button type="button" onClick={() => setShowDeleteConfirm(false)} className="rounded-full py-3 font-semibold text-text-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <p className="pb-2 text-xs font-semibold text-text-secondary">{text}</p>;
}

function RowDivider() {
  return <div className="h-px bg-white/15" />;
}

interface EditableRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function EditableRow({ label, value, onChange, placeholder = "", type = "text" }: EditableRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="text-sm font-semibold text-white">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-right text-sm text-white outline-none placeholder:text-white/50"
      />
    </div>
  );
}
