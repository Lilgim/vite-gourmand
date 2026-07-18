import type { Metadata } from "next";
import { getEmployeeAccounts } from "@/lib/queries/admin";
import { EmployeeForm } from "./employee-form";
import { ToggleEmployeeButton } from "./toggle-employee-button";

export const metadata: Metadata = { title: "Comptes employés" };

export default async function AdminEmployesPage() {
  const employees = await getEmployeeAccounts();

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">Comptes employés</h1>

      <section
        aria-labelledby="titre-creer-employe"
        className="mt-4 max-w-xl rounded border border-zinc-200 bg-zinc-50 p-4"
      >
        <h2 id="titre-creer-employe" className="text-lg font-bold">
          Créer un compte employé
        </h2>
        <EmployeeForm />
      </section>

      <section aria-labelledby="titre-liste-employes" className="mt-8">
        <h2 id="titre-liste-employes" className="text-lg font-bold">
          Employés ({employees.length})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Liste des comptes employés</caption>
            <thead>
              <tr className="border-b border-zinc-300 text-left">
                <th scope="col" className="py-2 pr-4">
                  Nom
                </th>
                <th scope="col" className="py-2 pr-4">
                  Email
                </th>
                <th scope="col" className="py-2 pr-4">
                  Statut
                </th>
                <th scope="col" className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-zinc-200 last:border-0"
                >
                  <td className="py-2 pr-4 font-medium">
                    {employee.first_name} {employee.last_name}
                  </td>
                  <td className="py-2 pr-4">{employee.email}</td>
                  <td className="py-2 pr-4">
                    {employee.is_active ? "Actif" : "Désactivé"}
                  </td>
                  <td className="py-2">
                    <ToggleEmployeeButton
                      employeeId={employee.id}
                      isActive={employee.is_active}
                      name={`${employee.first_name} ${employee.last_name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
