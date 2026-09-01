"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import SessionAccessController from "@/components/SessionAccessController";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <>
          <SessionAccessController />
          {children}
        </>
      </PersistGate>
    </Provider>
  );
}
