import { Suspense, use, useMemo, useRef } from "react";

type ChildrenFn<Params, Data> = (props: { params: Params; data: Data }) => React.ReactNode;

type LoaderProps<Params, Data> = {
  params?: Params;
  loader: (params: Params) => Promise<Data>;
  fallback?: React.ReactNode;
  children: ChildrenFn<Params, Data>;
}

type Props<Params, Data> = LoaderProps<Params, Data> & { data?: Data };

/**
 * @param props
 * render children({ params, data })
 *    - where data is either props.data when not undefined
 *    - if props.data is undefined, render props.fallback until the data is loaded with props.loader
 */
export function EnsureData<Params, Data>(props: Props<Params, Data>) {
  const { params, data, loader, fallback, children } = props;

  if (data) {
    return props.children({ params: params!, data });
  }

  return <LoaderComponent params={params} loader={loader} fallback={fallback}>
    {children}
  </LoaderComponent>;
}

function LoaderComponent<Params, Data>(props: LoaderProps<Params, Data>) {
  const paramsString = JSON.stringify(props.params);
  const params = useMemo(() => props.params, [paramsString]);

  // Work around React double invoking memos in dev mode
  const serverCall= useRef<{paramsString: string, promise: Promise<{params: Params, data: Data}> | null}> ({ paramsString, promise: null });

  const promise = useMemo(async () => {
    if (serverCall.current.paramsString === paramsString && serverCall.current.promise) {
      return serverCall.current.promise;
    }

    serverCall.current.paramsString = paramsString;
    serverCall.current.promise = props.loader(params!).then(data => ({
      params: params!,
      data,
    }));

    return serverCall.current.promise;
  }, [params]);

  return <Suspense fallback={props.fallback}>
    <RenderingComponent promise={promise}>
      {props.children}
    </RenderingComponent>
  </Suspense>
}

function RenderingComponent<Params, Data>(props: {
  promise: Promise<{ params: Params, data: Data }>,
  children: ChildrenFn<Params, Data>
}) {
  const { params, data } = use(props.promise);

  return props.children({ params, data });
}
