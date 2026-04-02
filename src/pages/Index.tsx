import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isOnboarded } from "@/lib/storage";

export default function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(isOnboarded() ? "/home" : "/onboarding", { replace: true });
  }, [navigate]);
  return null;
}
