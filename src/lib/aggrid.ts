"use client";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register once per client session
ModuleRegistry.registerModules([AllCommunityModule]);
