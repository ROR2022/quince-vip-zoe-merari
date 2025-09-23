import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';

// GET - Obtener estadísticas básicas de invitados  
export async function GET() {
  try {
    await connectDB();
    
    // Obtener estadísticas usando el método estático del modelo
    const stats = await Guest.getStats();
    
    // Obtener estadísticas adicionales por relación
    const relationStats = await Guest.aggregate([
      {
        $group: {
          _id: '$relation',
          count: { $sum: 1 },
          confirmed: {
            $sum: {
              $cond: [{ $eq: ['$attendance.confirmed', true] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Obtener estadísticas de confirmaciones por día (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyConfirmations = await Guest.aggregate([
      {
        $match: {
          'attendance.confirmed': true,
          'attendance.confirmedAt': { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$attendance.confirmedAt'
            }
          },
          count: { $sum: 1 },
          totalGuests: { $sum: '$attendance.numberOfGuestsConfirmed' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Obtener invitados recientes (últimos 10)
    const recentGuests = await Guest.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name relation status createdAt attendance.confirmed attendance.confirmedAt')
      .lean();
    
    // Formatear respuesta
    const response = {
      // Estadísticas principales
      overview: {
        totalGuests: stats.totalGuests,
        totalConfirmed: stats.totalConfirmed,
        totalInvited: stats.totalInvited,
        totalPending: stats.totalPending,
        totalGuestCount: stats.totalGuestCount,
        confirmationRate: stats.confirmationRate
      },
      
      // Estadísticas por relación
      byRelation: relationStats.map(item => ({
        relation: item._id,
        total: item.count,
        confirmed: item.confirmed,
        confirmationRate: item.count > 0 ? Math.round((item.confirmed / item.count) * 100) : 0
      })),
      
      // Confirmaciones por día
      dailyConfirmations: dailyConfirmations.map(item => ({
        date: item._id,
        confirmations: item.count,
        totalGuests: item.totalGuests
      })),
      
      // Invitados recientes
      recentGuests: recentGuests.map(guest => ({
        id: guest._id,
        name: guest.name,
        relation: guest.relation,
        status: guest.status,
        createdAt: guest.createdAt,
        confirmed: guest.attendance?.confirmed || false,
        confirmedAt: guest.attendance?.confirmedAt
      })),
      
      // Metadata
      generatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('❌ Error getting guest statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las estadísticas de invitados' 
      },
      { status: 500 }
    );
  }
}
