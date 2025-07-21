import { renderHook } from "@testing-library/react";

import { MockJSONServer, TestWrapper } from "@test";

import { useRedirectionAfterSubmission } from "../redirection";

const goMock = jest.fn();

describe("redirectionAfterSubmission Hook", () => {
  beforeEach(() => {
    goMock.mockReset();
  });

  const { result } = renderHook(() => useRedirectionAfterSubmission(), {
    wrapper: TestWrapper({
      dataProvider: MockJSONServer,
      resources: [{ name: "posts", route: "posts" }],
      routerProvider: {
        go: goMock,
      },
    }),
  });

  it("redirect list", async () => {
    result.current({
      redirect: "list",
      resource: { route: "posts", name: "posts", list: () => null },
      id: "1",
    });

    expect(goMock).toBeCalledWith({ to: "/posts", type: "push" });
  });

  it("redirect false", async () => {
    result.current({
      redirect: false,
      resource: { route: "posts", name: "posts" },
      id: "1",
    });

    expect(goMock).not.toBeCalled();
  });

  it("redirect show, canShow false", async () => {
    result.current({
      redirect: "show",
      resource: {
        route: "posts",
        name: "posts",
        list: () => null,
      },
      id: "1",
    });

    expect(goMock).toBeCalledWith({ to: "/posts", type: "push" });
  });

  it("redirect show, canShow true", async () => {
    result.current({
      redirect: "show",
      resource: {
        canShow: true,
        route: "posts",
        name: "posts",
        show: () => null,
      },
      id: "1",
    });

    expect(goMock).toBeCalledWith({ to: "/posts/show/1", type: "push" });
  });

  it("redirect edit, canEdit true", async () => {
    result.current({
      redirect: "edit",
      resource: {
        canEdit: true,
        route: "posts",
        name: "posts",
        edit: () => null,
      },
      id: "1",
    });

    expect(goMock).toBeCalledWith({ to: "/posts/edit/1", type: "push" });
  });

  it("redirect edit, canEdit false", async () => {
    result.current({
      redirect: "edit",
      resource: {
        canEdit: false,
        route: "posts",
        name: "posts",
        list: () => null,
      },
      id: "1",
    });

    expect(goMock).toBeCalledWith({ to: "/posts", type: "push" });
  });

  it("redirect create, canCreate true", async () => {
    result.current({
      redirect: "create",
      resource: {
        canCreate: true,
        route: "posts",
        name: "posts",
        create: () => null,
      },
    });

    expect(goMock).toBeCalledWith({ to: "/posts/create", type: "push" });
  });

  it("redirect create, canCreate false", async () => {
    result.current({
      redirect: "create",
      resource: {
        canCreate: false,
        route: "posts",
        name: "posts",
        list: () => null,
      },
    });

    expect(goMock).toBeCalledWith({ to: "/posts", type: "push" });
  });

  it("redirect edit, canEdit true, id null", async () => {
    result.current({
      redirect: "edit",
      resource: {
        canEdit: true,
        route: "posts",
        name: "posts",
        list: () => null,
      },
    });

    expect(goMock).toBeCalledWith({ to: "/posts", type: "push" });
  });

  it("redirect show, canShow true, id null", async () => {
    result.current({
      redirect: "show",
      resource: {
        canShow: true,
        route: "posts",
        name: "posts",
        show: () => null,
        list: () => null,
      },
    });

    expect(goMock).toBeCalledWith({ to: "/posts", type: "push" });
  });
});
