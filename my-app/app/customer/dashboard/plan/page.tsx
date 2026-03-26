import Navbar from "../Navbar";


export default function PlanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
     

      <main className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">
            My Subscription 📦
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your tiffin plan and daily meals
          </p>
        </div>

        {/* Active Plan */}
        <div className="rounded-3xl overflow-hidden shadow-xl mb-12 bg-white">
          
          {/* Top Gradient */}
          <div className="bg-gradient-to-r bg-orange-500 to-red-100 p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              
              <div>
                <p className="text-gray-700 text-xs font-bold uppercase tracking-widest mb-2">
                  Current Plan
                </p>
                <h2 className="text-3xl font-black">
                  Premium Monthly Thali
                </h2>

                <div className="flex gap-6 mt-6 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-700 uppercase">Started</p>
                    <p className="font-bold">15 Jan 2026</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-700 uppercase">Ends</p>
                    <p className="font-bold">14 Feb 2026</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center  w-20 h-20 rounded-2xl shadow-lg text-8xl">
                🍱
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Frequency */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Meal Frequency
              </p>
              <p className="text-lg font-extrabold text-gray-800">
                Lunch & Dinner
              </p>
              <p className="text-xs text-gray-500">
                Monday – Saturday
              </p>
            </div>

            {/* Remaining */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Meals Remaining
              </p>
              <p className="text-lg font-extrabold text-gray-800">
                18 / 26
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-full w-[70%] rounded-full"></div>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                Status
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="font-extrabold text-green-600">
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pause */}
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
            <h3 className="font-extrabold text-gray-800 mb-2">
              ⏸ Pause Subscription
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Going out of town? Pause your tiffin service and save money.
            </p>
            <button className="w-full py-3 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-orange-600 font-bold transition-all">
              Schedule Pause
            </button>
          </div>

          {/* Upgrade */}
          <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all">
            <h3 className="font-extrabold text-gray-800 mb-2">
              🔄 Change Plan
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Upgrade your plan or switch meal preferences anytime.
            </p>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold hover:opacity-90 transition-all">
              Upgrade Plan
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}