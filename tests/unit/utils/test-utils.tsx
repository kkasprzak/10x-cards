import { renderHook } from "@testing-library/react";
import type { ReactElement, ReactNode, ElementType } from "react";
import { vi } from "vitest";

// Utility for mocking fetch API
export const mockFetch = (data: unknown) => {
  return vi.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
  );
};

// Utility for creating test providers if needed
export const createTestWrapper = (providers: ReactElement[]) => {
  return function TestWrapper({ children }: { children: ReactNode }) {
    return providers.reduce(
      (acc, Provider) => {
        const { type: ProviderComponent, props } = Provider;
        const Component = ProviderComponent as ElementType;
        return <Component {...(props as Record<string, unknown>)}>{acc}</Component>;
      },
      <>{children}</>
    );
  };
};

// Example of how to test a custom hook with wrapper
export function renderHookWithProviders<Result, Props>(hook: (props: Props) => Result, providers: ReactElement[] = []) {
  const wrapper = createTestWrapper(providers);
  return renderHook(hook, { wrapper });
}
