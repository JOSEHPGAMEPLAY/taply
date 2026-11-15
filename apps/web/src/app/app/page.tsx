"use client";

import { Building2, FileText, Radio, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard principal con resumen de negocios, páginas y etiquetas.
 * Diseño profesional con tarjetas y gradientes.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">Bienvenido a Taply</h1>
        <p className="mt-2 text-blue-100 max-w-2xl">
          Gestiona tus negocios, páginas digitales y etiquetas NFC desde un solo lugar.
        </p>
        <Link
          href="/app/businesses"
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold"
        >
          Crear primer negocio
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Negocios</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link href="/app/businesses" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver negocios <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Páginas</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <Link href="/app/pages" className="mt-4 inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium">
            Ver páginas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">NFC Tags</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link href="/app/nfc-tags" className="mt-4 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver etiquetas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Getting started */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Primeros pasos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm font-bold">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Crea un negocio</p>
              <p className="text-xs text-gray-500 mt-0.5">Registra tu negocio con nombre y descripción</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-sm font-bold">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Crea una página</p>
              <p className="text-xs text-gray-500 mt-0.5">Diseña la página digital con botones</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 text-sm font-bold">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Asigna etiquetas</p>
              <p className="text-xs text-gray-500 mt-0.5">Programa NFC o genera códigos QR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
