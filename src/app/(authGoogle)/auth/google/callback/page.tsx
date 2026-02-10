
import StoreProvider from "@/app/StoreProvider";
import CallbackHandler from "@/components/Auth/CallBackHandler";
import React from "react";


export default function page() {
  return (
 <div className="mx-auto h-screen">
  <StoreProvider>
     <CallbackHandler/>
     </StoreProvider>
 </div>

  );
}
