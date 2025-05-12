import { useRouter } from "next/navigation";

const MyEventsTab = () => {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-3xl font-bold text-sky-800 mb-6">My Events</h1>
      <button
        onClick={() => router.push("/")}
        className="flex items-center justify-center px-2 py-2 border-2 rounded-2xl text-center bg-emerald-300 mb-4 hover:bg-emerald-600"
      >
        + Create Event
      </button>
      <div className="w-full px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div className="w-full h-[500px] bg-stone-50 rounded-lg shadow-xl overflow-hidden pb-4">
          <div className="relative h-80 overflow-hidden rounded-t-lg flex justify-center items-center py-4 px-4">
            <img
              src="https://picsum.photos/800/400"
              alt="Event Banner"
              className="h-full object-cover rounded-md"
            />
          </div>
          <h3 className="flex justify-center items-center text-lg font-semibold text-black px-4 pb-2">
            Konser Dewa 19
          </h3>
          <p className="px-4 pb-2 text-black text-sm">
            Date : <span>25 Dec 2023</span>
          </p>
          <h4 className="px-4 text-black text-sm">
            Category : <span>Music Concert</span>
          </h4>
          <p className="px-4 pt-2 text-black text-sm">
            Attendees : <span>45</span>
            <button
              onClick={() => router.push("/pages/attandees")}
              className="pl-2 text-sky-600 hover:underline"
            >
              View Details
            </button>
          </p>
          <p className="px-4 pt-2 text-black text-sm">
            Status : <span>On Going</span>
          </p>
          <p className="flex justify-end px-4 pt-1 text-blue-500 hover:underline">
            Edit Event
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyEventsTab;
