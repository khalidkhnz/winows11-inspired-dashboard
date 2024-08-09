"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useWindowDimensionHook from "@/hooks/useWindowDimensionHook";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import USERFOLER from "@/public/Windows Icons/Yellow Folder user.ico";
import THISPC from "@/public/Windows Icons/Computer.ico";
import CONTROLPANEL from "@/public/Windows Icons/Control Panel.ico";
import RECYCLEBINEMPTY from "@/public/Windows Icons/Trash Empty.ico";
import RECYCLEBINFULL from "@/public/Windows Icons/Trash Full.ico";
import useDetectOutsideClick from "@/hooks/detectOutsideClickHook";

export default function Page() {
  const [windows, setWindows] = useState<
    { title: string; id: number; content?: any }[]
  >([]);

  const apps: {
    title: string;
    content?: any;
    ICON: any;
    customCSS?: string;
    iconParentCSS?: string;
    onClick?: () => {} | any;
  }[] = [
    {
      title: "Khalid",
      ICON: USERFOLER,
    },
    {
      title: "This PC",
      ICON: THISPC,
      onClick: () => {
        setWindows((prev) => [
          ...prev,
          {
            id: prev.length > 0 ? prev[prev.length - 1].id + 1 : Date.now(),
            title: "NEW WINDOW",
            content: "This PC",
          },
        ]);
      },
    },
    {
      title: "Recycle Bin",
      ICON: RECYCLEBINEMPTY || RECYCLEBINFULL,
      customCSS: "object-contain pb-6",
      iconParentCSS: "absolute top-1",
    },
    {
      title: "Control Panel",
      ICON: CONTROLPANEL,
      customCSS: "p-2 object-contain",
    },
  ];

  const [activeWindow, setActiveWindow] = useState<null | number>(null);
  const { height, width } = useWindowDimensionHook();
  const [grid, setGrid] = useState({
    numberOfColumns: 0,
    numberOfRows: 0,
  });

  const blockSize = 120;

  useEffect(() => {
    const numberOfColumns = Math.floor(width / blockSize);
    const numberOfRows = Math.floor((height - 55) / blockSize);
    setGrid({
      numberOfColumns,
      numberOfRows,
    });
  }, [height, width]);

  return (
    <section className="relative flex h-screen w-full justify-center pt-4">
      <TooltipProvider>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${grid.numberOfColumns}, ${blockSize}px)`,
            gridTemplateRows: `repeat(${grid.numberOfRows}, ${blockSize}px)`,
            gridAutoFlow: "column",
          }}
          className="text-white"
        >
          {apps.map((app, idx) => {
            return (
              <Tooltip key={idx}>
                <TooltipTrigger>
                  <div
                    onDoubleClick={app.onClick ? app.onClick : () => {}}
                    className="relative flex h-[120px] w-[120px] items-center justify-center rounded-md border-white p-2 hover:bg-white/15"
                  >
                    {app.ICON && (
                      <div
                        className={cn(
                          "relative h-full w-full",
                          app.iconParentCSS,
                        )}
                      >
                        <Image
                          src={app.ICON}
                          alt={app.title}
                          className={cn("object-fill p-1", app.customCSS)}
                          fill
                        />
                      </div>
                    )}
                    <span className="absolute bottom-[2px] text-xs">
                      {app.title}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{app.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {windows?.map((win, index) => (
        <WindowModal
          key={win.id}
          initialX={100 + 20 * index}
          initialY={40 + 20 * index}
          idx={win.id}
          activeWindow={activeWindow == win.id}
          setActiveWindow={setActiveWindow}
          onClose={() =>
            setWindows((prev) => prev.filter((itm, i) => itm.id !== win.id))
          }
          title={win.title}
          content={<p className="text-xs text-white">{win.content}</p>}
        />
      ))}
    </section>
  );
}

function WindowModal({
  content,
  title,
  initialX,
  initialY,
  idx,
  onClose,
  maximize,
  activeWindow,
  setActiveWindow,
}: {
  content?: any;
  title?: string;
  initialX?: number;
  initialY?: number;
  idx?: number;
  maximize?: boolean;
  activeWindow?: boolean;
  onClose?: Function;
  setActiveWindow?: Function;
}) {
  const id = `${title?.split(" ").join("__")}__${idx}__`;
  const windowRef = useRef();

  //@ts-ignore
  useDetectOutsideClick(windowRef, () => setActiveWindow(null), windowRef);

  const [isMaximized, setIsMaximized] = useState(maximize || false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({
    top: initialY || 32,
    left: initialX || 32,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) {
      setIsMaximized(false);
      gsap.to(`.${id}`, {
        width: "800px",
        height: "600px",
        duration: 0.1,
      });
    }

    setDragging(true);
    setOffset({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      const newLeft = e.clientX - offset.x;
      const newTop = e.clientY - offset.y;

      setPosition({
        left: newLeft,
        top: newTop,
      });

      gsap.to(`.${id}`, {
        left: newLeft,
        top: newTop,
        duration: 0.1,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  function handleMinimize() {}

  function handleMaximize() {
    if (!isMaximized) {
      gsap
        .to(`.${id}`, {
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          duration: 0.1,
        })
        .then(() => {
          setPosition({
            left: 0,
            top: 0,
          });
        });
      setIsMaximized(true);
    } else {
      gsap
        .to(`.${id}`, {
          left: "50%",
          top: "50%",
          width: "800px",
          height: "600px",
          duration: 0.1,
        })
        .then(() => {
          setPosition({
            left: 0,
            top: 0,
          });
        });
      setIsMaximized(false);
    }
  }

  return (
    <div
      // @ts-ignore
      ref={windowRef}
      onMouseDown={() => setActiveWindow && setActiveWindow(idx)}
      style={{
        top: position.top,
        left: position.left,
        // width: "800px",
        // height: "600px",
      }}
      className={cn(
        "absolute right-8 top-8 flex w-fit flex-col overflow-hidden rounded-md border-[1px] border-gray-200/10 bg-gray-900/95 text-white backdrop-blur-md",
        id,
        {
          "border-blue-800": activeWindow && !isMaximized,
          "z-10 bg-gray-900/80 backdrop-blur-md": activeWindow,
          "rounded-none": isMaximized,
          "h-[500px] w-[400px] lg:h-[600px] lg:w-[800px]": true,
        },
      )}
    >
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "flex h-[40px] w-full cursor-pointer items-center justify-center gap-8 border-gray-500/50 bg-neutral-800/95 pl-3",
          {
            "bg-blue-800": activeWindow,
          },
        )}
      >
        <h1 className="text-sm font-normal capitalize">
          {title?.toLowerCase()}
        </h1>
        <div className="ml-auto flex w-fit items-center justify-center text-white">
          <Minimize //@ts-ignore
            onClick={handleMinimize}
            className="min-h-[40px] min-w-[45px] p-1 px-[14px] hover:bg-red-500"
          />
          <Maximize //@ts-ignore
            onClick={handleMaximize}
            className="min-h-[40px] min-w-[45px] p-[6px] px-[16px] hover:bg-red-500"
          />
          <Cross
            //@ts-ignore
            onClick={onClose}
            className="min-h-[40px] min-w-[45px] p-1 px-[14px] hover:bg-red-500"
          />
        </div>
      </div>
      <div className="p-3">{content}</div>
    </div>
  );
}

function Cross({ className, ...props }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={cn(className)}
      // class="lucide lucide-x"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
function Maximize({ className, ...props }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={cn(className)}
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}
function Minimize({ className, ...props }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={cn(className)}
      {...props}
    >
      <path d="M5 12h14" />
    </svg>
  );
}
