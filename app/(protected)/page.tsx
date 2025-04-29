"use client";

import { PRIVATE_ROUTES, PUBLIC_ROUTES, SELECTED_SALON_ID } from "@/constants";
import { LocalStorageManager } from "@/helpers/localStorageManager";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUserInfo, updateSelectedSalonId } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedBasePage() {
  const dispatch=useAppDispatch()

  const router = useRouter();
  const user =useAppSelector(selectUserInfo)


  const selectedSalonId=LocalStorageManager.get(SELECTED_SALON_ID)

  if(selectedSalonId){
    dispatch(updateSelectedSalonId(selectedSalonId))
  }

  if(!user){
    router.push(PUBLIC_ROUTES.LOGIN)
  }

  useEffect(() => {
    router.push(PRIVATE_ROUTES.DASHBOARD);
  }, [router]);

    return null
}
