import { Vessel } from '../models/Vessel.js';
import { User } from '../models/User.js';

/**
 * Örnek Gemi Filosu ve Kullanıcı Atama Verilerini MongoDB'ye Yükleyen Seeder Servisi
 * A Kullanıcısına 5 Gemi, B Kullanıcısına 3 Gemi (Ortak gemiler içeren) atar.
 */
export const seedFleetData = async () => {
  try {
    // 1. Örnek Gemilerin Tanımlanması (8 Adet Gemi)
    const sampleVessels = [
      {
        vesselName: 'Thamesborg',
        imoNumber: '9546461',
        mmsi: '244750431',
        callSign: 'PBFZ',
        flag: 'Netherlands',
        vesselType: 'General Cargo',
        grossTonnage: 11864,
        ownerCompany: 'Wagenborg Shipping'
      },
      {
        vesselName: 'Euphoria',
        imoNumber: '9427328',
        mmsi: '352001892',
        callSign: '3E2198',
        flag: 'Panama',
        vesselType: 'Container Ship',
        grossTonnage: 41200,
        ownerCompany: 'Ocean Legend Lines'
      },
      {
        vesselName: 'M/T Poseidon',
        imoNumber: '9876543',
        mmsi: '271043987',
        callSign: 'TC9921',
        flag: 'Turkey',
        vesselType: 'Tanker',
        grossTonnage: 55000,
        ownerCompany: 'MyCarbons Marine Fleet'
      },
      {
        vesselName: 'Pacific Pride',
        imoNumber: '9654321',
        mmsi: '538004123',
        callSign: 'V7AB9',
        flag: 'Marshall Islands',
        vesselType: 'Bulk Carrier',
        grossTonnage: 32000,
        ownerCompany: 'Pacific Maritime Ltd'
      },
      {
        vesselName: 'Green Emerald',
        imoNumber: '9781234',
        mmsi: '636015982',
        callSign: 'A8LK3',
        flag: 'Liberia',
        vesselType: 'LNG Carrier',
        grossTonnage: 98000,
        ownerCompany: 'Green Energy Shipping'
      },
      {
        vesselName: 'Atlantic Titan',
        imoNumber: '9312567',
        mmsi: '235089456',
        callSign: '2GHT5',
        flag: 'United Kingdom',
        vesselType: 'Bulk Carrier',
        grossTonnage: 45000,
        ownerCompany: 'Atlantic Bulk Shipping'
      },
      {
        vesselName: 'Solar Clipper',
        imoNumber: '9823456',
        mmsi: '256987123',
        callSign: '9HOK8',
        flag: 'Malta',
        vesselType: 'Container Ship',
        grossTonnage: 62000,
        ownerCompany: 'Clipper Eco Fleet'
      },
      {
        vesselName: 'Bosphorus Star',
        imoNumber: '9123890',
        mmsi: '271000123',
        callSign: 'TCA44',
        flag: 'Turkey',
        vesselType: 'Tugboat',
        grossTonnage: 1200,
        ownerCompany: 'Istanbul Port Services'
      }
    ];

    const createdVessels = [];
    for (const vData of sampleVessels) {
      const existing = await Vessel.findOne({ imoNumber: vData.imoNumber });
      if (!existing) {
        const v = await Vessel.create(vData);
        createdVessels.push(v);
      } else {
        createdVessels.push(existing);
      }
    }

    // 2. Örnek Kullanıcıların Oluşturulması ve Gemi Atamaları
    // User A: 5 Gemi (Thamesborg, Euphoria, M/T Poseidon, Pacific Pride, Green Emerald)
    const userAVessels = createdVessels.slice(0, 5).map(v => v._id);

    // User B: 3 Gemi (M/T Poseidon [ortak gemi], Atlantic Titan, Solar Clipper)
    const userBVessels = [createdVessels[2]._id, createdVessels[5]._id, createdVessels[6]._id];

    let userA = await User.findOne({ email: 'ahmet.armator@mycarbons.com' });
    if (!userA) {
      userA = await User.create({
        name: 'Ahmet Armatör (A Kullanıcısı)',
        email: 'ahmet.armator@mycarbons.com',
        password: 'password123',
        role: 'armator',
        assignedVessels: userAVessels
      });
    } else {
      userA.assignedVessels = userAVessels;
      await userA.save();
    }

    let userB = await User.findOne({ email: 'burak.operator@mycarbons.com' });
    if (!userB) {
      userB = await User.create({
        name: 'Burak Operatör (B Kullanıcısı)',
        email: 'burak.operator@mycarbons.com',
        password: 'password123',
        role: 'operator',
        assignedVessels: userBVessels
      });
    } else {
      userB.assignedVessels = userBVessels;
      await userB.save();
    }

    return {
      success: true,
      vesselsCount: createdVessels.length,
      users: [
        { name: userA.name, email: userA.email, vesselCount: userA.assignedVessels.length },
        { name: userB.name, email: userB.email, vesselCount: userB.assignedVessels.length }
      ]
    };
  } catch (err) {
    console.error('❌ Gemi ve Kullanıcı Seeder Hatası:', err.message);
    throw err;
  }
};
