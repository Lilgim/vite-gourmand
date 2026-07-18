"use client";

import { useActionState } from "react";
import { toggleMenuActive } from "@/app/actions/employee";
import { initialFormState } from "@/lib/validation";

type ToggleMenuButtonProps = {
  menuId: number;
  isActive: boolean;
  title: string;
};

export const ToggleMenuButton = ({
  menuId,
  isActive,
  title,
}: ToggleMenuButtonProps) => {
  const [state, action, pending] = useActionState(
    toggleMenuActive,
    initialFormState,
  );

  return (
    <form action={action} className="inline">
      <input type="hidden" name="menu_id" value={menuId} />
      <button
        type="submit"
        disabled={pending}
        className="text-zinc-700 underline disabled:opacity-60"
      >
        {isActive ? "Masquer" : "Publier"}
        <span className="sr-only"> le menu {title}</span>
      </button>
      {state.status === "error" && state.message && (
        <span role="alert" className="ml-2 text-red-700">
          {state.message}
        </span>
      )}
    </form>
  );
};
