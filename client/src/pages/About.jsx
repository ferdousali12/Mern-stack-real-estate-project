export const About = () => {
  return (
    <div className="max-w-3xl mx-auto p-3 py-10 flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">About Ferdous Estate</h1>
      <p className="text-slate-700">
        Ferdous Estate is a demo real-estate application where users can create
        an account, manage a profile, and publish property listings.
      </p>
      <p className="text-slate-700">
        Use the search bar to find properties by name, address, or description.
        Signed-in users can create, edit, and delete their own listings.
      </p>
    </div>
  );
};
