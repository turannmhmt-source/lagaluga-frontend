"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { callApi, uploadFile } from "@/lib/api";