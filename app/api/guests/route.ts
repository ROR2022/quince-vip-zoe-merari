import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';

// GET - Listar invitados con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const relation = searchParams.get('relation');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Construir query de MongoDB con tipo específico
    const filterQuery: Record<string, unknown> = {};
    
    // Filtro por búsqueda (nombre)
    if (search && search.trim()) {
      filterQuery.name = { $regex: search.trim(), $options: 'i' };
    }
    
    // Filtro por estado
    if (status && status !== 'all') {
      filterQuery.status = status;
    }
    
    // Filtro por relación
    if (relation && relation !== 'all') {
      filterQuery.relation = relation;
    }
    
    // Calcular paginación
    const skip = (page - 1) * limit;
    
    // Ejecutar consulta con paginación
    const [guests, total] = await Promise.all([
      Guest.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Para mejor performance
      Guest.countDocuments(filterQuery)
    ]);
    
    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return NextResponse.json({
      success: true,
      data: {
        guests,
        pagination: {
          current: page,
          total: totalPages,
          hasNext,
          hasPrev,
          totalItems: total
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting guests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la lista de invitados' 
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo invitado
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, phone, relation, personalInvitation, attendance } = body;
    
    // Validaciones básicas
    if (!name || !name.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre es obligatorio' 
        },
        { status: 400 }
      );
    }
    
    if (!relation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La relación es obligatoria' 
        },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe un invitado con el mismo nombre
    const existingGuest = await Guest.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });
    
    if (existingGuest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un invitado con ese nombre' 
        },
        { status: 400 }
      );
    }
    
    // Crear nuevo invitado
    const guestData: {
      name: string;
      relation: string;
      phone?: string;
      personalInvitation?: unknown;
      attendance?: unknown;
    } = {
      name: name.trim(),
      relation
    };
    
    // Agregar teléfono si se proporciona
    if (phone && phone.trim()) {
      guestData.phone = phone.trim();
    }
    
    // Agregar datos de invitación personalizada si se proporcionan
    if (personalInvitation) {
      guestData.personalInvitation = personalInvitation;
    }
    
    // Agregar datos de confirmación si se proporcionan
    if (attendance) {
      guestData.attendance = attendance;
    }
    
    const newGuest = new Guest(guestData);
    await newGuest.save();
    
    console.log('✅ Guest created successfully:', newGuest.name);
    
    return NextResponse.json({
      success: true,
      data: newGuest,
      message: 'Invitado creado exitosamente'
    }, { status: 201 });
    
  } catch (error: unknown) {
    console.error('❌ Error creating guest:', error);
    
    // Manejar errores de validación de Mongoose
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const mongooseError = error as unknown as { errors: Record<string, { message: string }> };
      const validationErrors = Object.values(mongooseError.errors).map((err) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Errores de validación',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
