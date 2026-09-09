import { notFound } from "next/navigation";

/** Group-order admin UI is retired; keep the route as a 404. */
export default function AdminGroupOrdersPage() {
  notFound();
}
