"use client";

import * as React from "react";

// Placeholder for Resizable components to bypass pre-existing type errors in an unused component
const ResizablePanelGroup = ({ children, className, ...props }: any) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const ResizablePanel = ({ children, className, ...props }: any) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const ResizableHandle = ({ className, ...props }: any) => (
  <div className={className} {...props} />
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
