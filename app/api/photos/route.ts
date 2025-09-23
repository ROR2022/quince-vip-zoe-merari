import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Photo from '@/models/Photo'

interface PhotoData {
  // Identificación
  filename: string;
  originalName: string;
  
  // URLs y Storage
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  localPath?: string;
  uploadSource: 'cloudinary' | 'local';
  
  // Metadata del archivo
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  
  // Información del usuario
  uploader: {
    name?: string;
    ip: string;
    userAgent: string;
  };
  
  // Contexto de la boda
  eventMoment?: string;
  comment?: string;
  
  // Control y moderación
  uploadedAt?: Date;
  isPublic?: boolean;
  status?: 'uploading' | 'ready' | 'processing' | 'error';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  
  // Metadata adicional
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    const query: Record<string, unknown> = {}
    
    if (category) {
      query.category = category
    }
    
    if (tag) {
      query.tags = { $in: [tag] }
    }
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const skip = (page - 1) * limit

    const [photos, total] = await Promise.all([
      Photo.find(query)
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Photo.countDocuments(query)
    ])

    return NextResponse.json({
      photos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const photoData: PhotoData = await request.json()

    console.log('📸 Received photo data for MongoDB:', photoData);

    // Validación básica
    if (!photoData.filename) {
      return NextResponse.json(
        { error: 'filename es requerido' },
        { status: 400 }
      )
    }

    if (!photoData.originalName) {
      return NextResponse.json(
        { error: 'originalName es requerido' },
        { status: 400 }
      )
    }

    if (!photoData.uploadSource) {
      return NextResponse.json(
        { error: 'uploadSource es requerido' },
        { status: 400 }
      )
    }

    // Validar que tenga al menos una URL
    if (!photoData.cloudinaryUrl && !photoData.localPath) {
      return NextResponse.json(
        { error: 'Se requiere cloudinaryUrl o localPath' },
        { status: 400 }
      )
    }

    const photo = new Photo({
      ...photoData,
      uploadedAt: photoData.uploadedAt || new Date(),
      isPublic: photoData.isPublic !== false, // Por defecto true
      status: photoData.status || 'ready',
      moderationStatus: photoData.moderationStatus || 'approved'
    })

    await photo.save()

    console.log('✅ Photo saved to MongoDB:', photo._id);

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating photo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}