export default function Profile({ user }) {
  if (!user) return null;
  return (
    <div className="flex flex-col items-center gap-3 p-4 text-center">
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name || "Profile"}
          className="h-16 w-16 rounded-full border-2 border-blue-500 object-cover"
        />
      )}
      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
      <p className="text-sm text-secondary-text">{user.email}</p>
    </div>
  );
}
