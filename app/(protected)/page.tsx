"use client";

import { PRIVATE_ROUTES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedBasePage() {

  const router = useRouter();

  useEffect(() => {
    router.push(PRIVATE_ROUTES.DASHBOARD);
  }, [router]);

    return null
}
