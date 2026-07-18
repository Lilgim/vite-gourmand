"use client";

import { useActionState } from "react";
import { toggleEmployeeActive } from "@/app/actions/admin";
import { initialFormState } from "@/lib/validation";

type ToggleEmployeeButtonProps = {
  employeeId: number;
  isActive: boolean;
  name: string;
};

export const ToggleEmployeeButton = ({
  employeeId,
  isActive,
  name,
}: ToggleEmployeeButtonProps) => {
  const [state, action, pending] = useActionState(
    toggleEmployeeActive,
    initialFormState,
  );

  return (
    <form action={action} className="inline">
      <input type="hidden" name="employee_id" value={employeeId} />
      <button
        type="submit"
        disabled={pending}
        className={`underline disabled:opacity-60 ${
          isActive ? "text-red-800" : "text-primary"
        }`}
      >
        {isActive ? "Désactiver" : "Réactiver"}
        <span className="sr-only"> le compte de {name}</span>
      </button>
      {state.status === "error" && state.message && (
        <span role="alert" className="ml-2 text-red-700">
          {state.message}
        </span>
      )}
    </form>
  );
};
