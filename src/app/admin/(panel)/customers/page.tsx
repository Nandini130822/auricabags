import Link from "next/link";
import { Search } from "lucide-react";
import { Card, PageHeader, Pill, Table, Td, input } from "@/components/admin/ui";
import { adminCustomers } from "@/lib/admin-data";
import { date, inr } from "@/lib/format";

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const all = await adminCustomers();
  const s = q.toLowerCase();
  const list = all.filter((c) => !s || [c.full_name, c.email, c.phone].join(" ").toLowerCase().includes(s));
  return (
    <>
      <PageHeader title="Customers" sub={`${all.length} accounts`} />
      <Card>
        <form className="relative mb-4 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search name, email or phone" className={`${input} pl-9`} />
        </form>
        <Table head={["Customer", "Phone", "Joined", "Orders", "Spent", "Role", ""]} empty={!list.length}>
          {list.map((c) => (
            <tr key={c.id} className="hover:bg-ivory/60">
              <Td>
                <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-cream font-display text-sm">
                    {(c.full_name || c.email || "?")[0].toUpperCase()}
                  </span>
                  <span>
                    <span className="block font-medium hover:underline">{c.full_name || "—"}</span>
                    <span className="block text-xs text-muted">{c.email}</span>
                  </span>
                </Link>
              </Td>
              <Td className="text-muted">{c.phone ?? "—"}</Td>
              <Td className="text-muted">{date(c.created_at)}</Td>
              <Td>{c.orders}</Td>
              <Td>{inr(c.spent)}</Td>
              <Td>
                <span className="flex gap-1">
                  <Pill value={c.role} />
                  {c.is_blocked && <Pill value="blocked" />}
                </span>
              </Td>
              <Td>
                <Link href={`/admin/customers/${c.id}`} className="text-xs underline">
                  View
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
