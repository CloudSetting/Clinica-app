"use client";
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs"; // 🚀 Importación para encriptar la contraseña de acceso

const ESPECIALIDADES = [
  "Medicina General", "Psicología Clínica", "Pediatría", 
  "Kinesiología", "Nutrición", "Dermatología"
];

export default function ProfesionalModal({ isOpen, onClose, profesional, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    especialidad: "",
    email: "",
    telefono: "",
    foto_url: "",
    descripcion: "",
    calendario_tipo: "google",
    password: "" // 🚀 Agregado al estado inicial del componente
  });

  // Si recibimos un profesional (para editar), llenamos el form
  useEffect(() => {
    if (profesional) {
      const [nombre, ...apellidoParts] = profesional.nombre.split(" ");
      setFormData({
        ...profesional,
        nombre: nombre || "",
        apellido: apellidoParts.join(" ") || "",
        calendario_tipo: profesional.calendario_tipo || "google",
        password: "" // Se deja vacío al editar por seguridad
      });
    } else {
      setFormData({
        nombre: "", apellido: "", especialidad: "", email: "",
        telefono: "", foto_url: "", descripcion: "", calendario_tipo: "google",
        password: ""
      });
    }
  }, [profesional, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let hashedPassword = null;

      // Al crear uno nuevo, exigimos la contraseña
      if (!profesional?.id) {
        if (!formData.password || formData.password.length < 6) {
          alert("La contraseña es obligatoria y debe tener un mínimo de 6 caracteres.");
          setLoading(false);
          return;
        }
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(formData.password, salt);
      } else if (formData.password) {
        // Si estamos editando y el administrador escribió una nueva contraseña, la actualizamos
        if (formData.password.length < 6) {
          alert("La nueva contraseña debe tener un mínimo de 6 caracteres.");
          setLoading(false);
          return;
        }
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(formData.password, salt);
      }

      // Estructuramos el payload limpio para Supabase combinando Nombre y Apellido
      const dataToSend = {
        nombre: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
        especialidad: formData.especialidad,
        email: formData.email.trim().toLowerCase(),
        correo: formData.email.trim().toLowerCase(), // Duplicado preventivo por consistencia de columnas
        telefono: formData.telefono,
        foto_url: formData.foto_url,
        descripcion: formData.descripcion,
        calendario_tipo: formData.calendario_tipo,
      };

      // Si se generó un hash de contraseña (creación o actualización), lo añadimos al payload
      if (hashedPassword) {
        dataToSend.password_hash = hashedPassword;
      }

      let error;
      if (profesional?.id) {
        // ACTUALIZAR
        ({ error } = await supabase
          .from('profesionales')
          .update(dataToSend)
          .eq('id', profesional.id));
      } else {
        // INSERTAR
        ({ error } = await supabase
          .from('profesionales')
          .insert([dataToSend]));
      }

      if (error) throw error;
      
      alert("¡Éxito! Registro guardado correctamente.");
      onSave(); 
      onClose();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {profesional ? 'Editar Profesional' : 'Nuevo Profesional'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" required value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input type="text" required value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Especialidad</label>
            <select required value={formData.especialidad}
              onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2">
              <option value="">Seleccione...</option>
              {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
          </div>

          {/* 🚀 DISEÑO MEJORADO: Fila limpia para Correo y Contraseña */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" placeholder="ejemplo@clinica.cl" required value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {profesional ? "Nueva Contraseña (Opcional)" : "Contraseña de Acceso"}
              </label>
              <input type="password" placeholder={profesional ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
                required={!profesional?.id} value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" placeholder="+569..." value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">URL Foto</label>
            <input type="url" value={formData.foto_url}
              onChange={(e) => setFormData({...formData, foto_url: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción (Máx 200 car.)</label>
            <textarea maxLength={200} value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 h-20" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo de Calendario</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="cal" value="google" 
                  checked={formData.calendario_tipo === "google"}
                  onChange={() => setFormData({...formData, calendario_tipo: "google"})} />
                Google
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="cal" value="outlook" 
                  checked={formData.calendario_tipo === "outlook"}
                  onChange={() => setFormData({...formData, calendario_tipo: "outlook"})} />
                Outlook
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Profesional'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}