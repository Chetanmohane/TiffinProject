// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AuthLayout({ title, children }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-50 px-4">
      <div className="max-w-lg bg-white rounded-xl shadow-lg p-8 w-full  shadow-red-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-orange-600 mt-10">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
