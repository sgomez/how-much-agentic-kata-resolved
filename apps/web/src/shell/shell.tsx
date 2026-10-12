import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter } from "react-router";
import type { RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";

import { HomePage } from "./home-page.tsx";
import { Layout } from "./layout.tsx";
import { NotFoundPage } from "./not-found-page.tsx";
import { queryClient } from "./query-client.ts";
import { RequireNickname } from "./require-nickname.tsx";
import { SignInPage } from "./sign-in-page.tsx";

/** Data-mode router: the shell's own pages plus every feature's routes, behind the nickname. */
export const createAppRouter = (featureRoutes: RouteObject[]) =>
  createBrowserRouter([
    {
      element: <Layout />,
      children: [
        { path: "/sign-in", element: <SignInPage /> },
        {
          element: <RequireNickname />,
          children: [{ index: true, element: <HomePage /> }, ...featureRoutes],
        },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ]);

export const Shell = ({
  router,
}: {
  router: ReturnType<typeof createAppRouter>;
}) => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
