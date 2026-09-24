import { ReactElement, Children, useEffect, useRef, useState } from "react";

type PagePanelProps = {
  children?: React.ReactNode;
};

function useInterval(callback: VoidFunction, delay: number) {
  const savedCallback = useRef<VoidFunction>(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const id = setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function PagePanel(props: PagePanelProps) {
  const [page, setPage] = useState(0);
  const [childs, setChilds] = useState(
    Children.toArray(props.children) as ReactElement<any, any>[]
  );

  useInterval(() => {
    if (page + 1 === childs.length) {
      setPage(0);
    } else {
      setPage(page + 1);
    }
  }, 10000);

  return childs[page];
}
