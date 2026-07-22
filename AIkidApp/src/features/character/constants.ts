import type {
  CategoryAnswers,
  CategoryQuestionDef,
  CharacterCategoryId,
  CharacterDraft,
} from './types';

/** Fixed catalog migrated from the original AIkid question set. */
export const CATEGORY_QUESTIONS: Record<
  CharacterCategoryId,
  CategoryQuestionDef[]
> = {
  shape: [
    {
      label: '1. NHÂN VẬT CỦA EM LÀ GÌ?',
      subject: 'Nhân vật',
      choices: ['con người', 'con vật', 'đồ vật', 'thực vật', 'robot'],
      placeholder: 'Ví dụ: con mèo, con gấu, siêu nhân...',
    },
    {
      label: '2. NHÂN VẬT CÓ DÁNG NGƯỜI THẾ NÀO?',
      subject: 'Dáng người',
      choices: [
        'tròn trịa',
        'mảnh mai',
        'nhỏ bé',
        'cao lớn',
        'mũm mĩm',
        'vuông vức',
        'tam giác',
      ],
      placeholder: 'Ví dụ: dáng vẻ tròn xoe, cao gầy, mũm mĩm...',
    },
    {
      label: '3. NHÂN VẬT CÓ DA MÀU GÌ?',
      subject: 'Màu da',
      choices: [
        'trắng hồng',
        'nâu bánh mật',
        'rám nắng',
        'xanh lá cây',
        'xám sáng',
      ],
      placeholder: 'Ví dụ: da trắng hồng, da rám nắng...',
    },
    {
      label: '4. CHẤT LIỆU CỦA NHÂN VẬT LÀ GÌ?',
      subject: 'Chất liệu',
      choices: ['da mềm', 'lông', 'vải bông', 'kim loại', 'gỗ', 'thủy tinh'],
      placeholder: 'Ví dụ: da mềm, vải bông, gỗ...',
    },
    {
      label: '5. NHÂN VẬT CÓ HỌA TIẾT GÌ TRÊN CƠ THỂ?',
      subject: 'Họa tiết',
      choices: [
        'không có họa tiết',
        'sọc vằn tinh nghịch',
        'đốm tròn đáng yêu',
      ],
      placeholder: 'Ví dụ: sọc vằn tinh nghịch, đốm tròn...',
    },
    {
      label: '6. TỔNG THỂ NHÂN VẬT TẠO CẢM GIÁC GÌ?',
      subject: 'Cảm giác',
      choices: [
        'đáng yêu',
        'vui nhộn',
        'mạnh mẽ',
        'bí ẩn',
        'ngốc nghếch',
        'kỳ lạ',
        'độc ác',
      ],
      placeholder: 'Ví dụ: đáng yêu, vui nhộn...',
    },
  ],
  parts: [
    {
      label: '1. TAY CỦA NHÂN VẬT TRÔNG NHƯ THẾ NÀO?',
      subject: 'Tay',
      choices: [
        'không có tay',
        'tay dài',
        'tay ngắn',
        'tay mèo',
        'tay robot',
        'cánh',
        'xúc tu',
      ],
      placeholder: 'Ví dụ: 4 tay robot dài...',
    },
    {
      label: '2. CHÂN CỦA NHÂN VẬT TRÔNG NHƯ THẾ NÀO?',
      subject: 'Chân',
      choices: [
        'không có chân',
        'chân dài',
        'chân ngắn',
        'chân mèo',
        'đuôi cá',
        'bánh xe',
        'lò xo',
      ],
      placeholder: 'Ví dụ: 2 chân mèo ngắn cũn...',
    },
    {
      label: '3. NHÂN VẬT CÓ CÁNH KHÔNG?',
      subject: 'Cánh',
      choices: [
        'cánh chim',
        'cánh bướm',
        'cánh dơi',
        'cánh máy bay',
        'không có cánh',
      ],
      placeholder: 'Ví dụ: cánh chim màu trắng, cánh bướm rực rỡ...',
    },
    {
      label: '4. NHÂN VẬT CÓ ĐUÔI KHÔNG?',
      subject: 'Đuôi',
      choices: [
        'đuôi ngắn',
        'đuôi dài',
        'đuôi xù bông',
        'đuôi cá',
        'không có đuôi',
      ],
      placeholder: 'Ví dụ: đuôi sóc xù bông, đuôi mèo dài...',
    },
    {
      label: '5. NHÂN VẬT CÓ SỪNG KHÔNG?',
      subject: 'Sừng',
      choices: [
        'không có sừng',
        'sừng tuần lộc',
        'sừng trâu',
        'sừng kỳ lân',
      ],
      placeholder: 'Ví dụ: sừng tuần lộc nhỏ, không có sừng...',
    },
  ],
  face: [
    {
      label: '1. MẮT CỦA NHÂN VẬT TRÔNG NHƯ THẾ NÀO?',
      subject: 'Mắt',
      choices: [
        'không có mắt',
        'to tròn',
        'nhỏ xíu',
        'cụp xuống',
        'lấp lánh',
        'khác màu nhau',
      ],
      placeholder: 'Ví dụ: 3 mắt to tròn màu xanh nước biển...',
    },
    {
      label: '2. MIỆNG CỦA NHÂN VẬT NHƯ THẾ NÀO?',
      subject: 'Miệng',
      choices: [
        'miệng cười tươi',
        'ngậm kẹo mút',
        'miệng mếu',
        'chu môi',
        'không có miệng',
      ],
      placeholder: 'Ví dụ: miệng cười tươi rói, đang ngậm kẹo...',
    },
    {
      label: '3. MŨI CỦA NHÂN VẬT NHƯ THẾ NÀO?',
      subject: 'Mũi',
      choices: [
        'mũi nhỏ xinh',
        'mũi nút áo',
        'mũi chú hề đỏ',
        'không có mũi',
      ],
      placeholder: 'Ví dụ: mũi nút áo dễ thương, mũi chú hề đỏ...',
    },
    {
      label: '4. TAI CỦA NHÂN VẬT TRÔNG NHƯ THẾ NÀO?',
      subject: 'Tai',
      choices: [
        'không có tai',
        'tai tròn',
        'tai mèo',
        'tai người',
        'tai robot',
      ],
      placeholder: 'Ví dụ: đôi tai mèo tinh nghịch, tai thỏ dài...',
    },
    {
      label: '5. KHUÔN MẶT CÓ GÌ ĐẶC BIỆT KHÔNG?',
      subject: 'Điểm đặc biệt',
      choices: [
        'không có',
        'tàn nhang',
        'nốt ruồi',
        'má hồng',
        'môi hồng',
        'vết sẹo',
      ],
      placeholder: 'Ví dụ: nốt ruồi ở dưới mắt, sẹo ở ngang mũi...',
    },
    {
      label: '6. BIỂU CẢM CỦA NHÂN VẬT THẾ NÀO?',
      subject: 'Biểu cảm',
      choices: ['vui vẻ', 'tinh nghịch', 'ngạc nhiên', 'lo lắng', 'độc ác'],
      placeholder: 'Ví dụ: vui vẻ, ngạc nhiên, lo lắng...',
    },
  ],
  hair: [
    {
      label: '1. KIỂU TÓC/LÔNG CỦA NHÂN VẬT THẾ NÀO?',
      subject: 'Kiểu tóc/lông',
      choices: [
        'không tóc/lông',
        'mượt mà',
        'xoăn tít',
        'dựng đứng',
        'lộn xộn',
        'phát sáng',
      ],
      placeholder: 'Ví dụ: mượt mà, xoăn tít, dựng đứng...',
    },
    {
      label: '2. TÓC MÁI CỦA NHÂN VẬT TRÔNG THẾ NÀO?',
      subject: 'Tóc mái',
      choices: ['mái ngố dễ thương', 'mái lệch', 'mái thưa', 'không có mái'],
      placeholder: 'Ví dụ: mái ngố dễ thương, mái lệch...',
    },
    {
      label: '3. MÀU TÓC/LÔNG CỦA NHÂN VẬT LÀ MÀU GÌ?',
      subject: 'Màu tóc/lông',
      choices: [
        'màu hạt dẻ',
        'hồng pastel',
        'vàng kim',
        'đen láy',
        'xanh mint',
      ],
      placeholder: 'Ví dụ: màu nâu hạt dẻ, hồng pastel...',
    },
    {
      label: '4. ĐỘ DÀI TÓC/LÔNG CỦA NHÂN VẬT THẾ NÀO?',
      subject: 'Độ dài tóc/lông',
      choices: ['tóc ngắn', 'tóc ngang vai', 'tóc dài thướt tha'],
      placeholder: 'Ví dụ: tóc ngắn cá tính, tóc dài thướt tha...',
    },
    {
      label: '5. TÓC/ LÔNG CÓ ĐIỂM GÌ ĐẶC BIỆT KHÔNG?',
      subject: 'Điểm đặc biệt',
      choices: ['không có', 'highlight', 'ombre'],
      placeholder: 'Ví dụ: tóc highlight màu vàng, lông đuôi phát sáng...',
    },
    {
      label: '6. NHÂN VẬT CÓ ĐEO PHỤ KIỆN ĐẦU KHÔNG?',
      subject: 'Phụ kiện đầu',
      choices: [
        'không có phụ kiện',
        'nơ màu hồng',
        'bờm tai gấu',
        'kẹp tóc ngôi sao',
      ],
      placeholder: 'Ví dụ: kẹp tóc ngôi sao, bờm tai gấu...',
    },
  ],
  clothes: [
    {
      label: '1. NHÂN VẬT MẶC ÁO KIỂU GÌ?',
      subject: 'Áo',
      choices: ['áo hoodie khủng long', 'áo thun kẻ sọc', 'áo khoác len'],
      placeholder: 'Ví dụ: mặc áo hoodie khủng long, áo thun sọc...',
    },
    {
      label: '2. NHÂN VẬT MẶC QUẦN HAY VÁY?',
      subject: 'Quần/Váy',
      choices: ['váy xếp ly hồng', 'quần yếm bò', 'quần shorts'],
      placeholder: 'Ví dụ: mặc váy xếp ly hồng, quần yếm bò...',
    },
    {
      label: '3. NHÂN VẬT ĐI GIÀY DÉP GÌ?',
      subject: 'Giày dép',
      choices: [
        'không đi giày dép',
        'giày thể thao trắng',
        'ủng đỏ đáng yêu',
        'sandal',
      ],
      placeholder: 'Ví dụ: đi giày thể thao trắng, ủng đỏ...',
    },
    {
      label: '4. NHÂN VẬT ĐEO PHỤ KIỆN GÌ?',
      subject: 'Phụ kiện',
      choices: [
        'không có phụ kiện',
        'khăn quàng cổ đỏ',
        'ba lô gấu trúc',
        'túi chéo nhỏ',
      ],
      placeholder: 'Ví dụ: đeo khăn quàng cổ đỏ, đeo ba lô gấu...',
    },
  ],
};

export function defaultCategoryInputs(): CategoryAnswers {
  return {
    shape: [
      'con vật',
      'tròn trịa',
      'trắng hồng',
      'lông',
      'không có họa tiết',
      'đáng yêu',
    ],
    parts: [
      'tay ngắn',
      'chân ngắn',
      'không có cánh',
      'đuôi ngắn',
      'không có sừng',
    ],
    face: [
      'to tròn',
      'miệng cười tươi',
      'mũi nút áo',
      'tai người',
      'không có',
      'tinh nghịch',
    ],
    hair: [
      'xoăn tít',
      'mái lệch',
      'màu hạt dẻ',
      'tóc ngắn',
      'không có',
      'không có phụ kiện',
    ],
    clothes: [
      'áo hoodie khủng long',
      'quần yếm bò',
      'giày thể thao trắng',
      'khăn quàng cổ đỏ',
    ],
  };
}

export function defaultSelectedAnswerKeys(): string[] {
  return CATEGORY_QUESTIONS.shape.map((_, index) => `shape-${index}`);
}

export function createEmptyDraft(): CharacterDraft {
  return {
    schemaVersion: 1,
    name: '',
    age: '',
    gender: '',
    birthday: '',
    species: '',
    description: '',
    activeCategory: 'shape',
    categoryInputs: defaultCategoryInputs(),
    selectedAnswerKeys: defaultSelectedAnswerKeys(),
    ideaNotes: {},
    uploadedImageUri: null,
    generatedImageUri: null,
    updatedAt: new Date().toISOString(),
  };
}

/** Build user-only prompt (no STYLE_PROMPT) — ready for future jobs API */
export function buildCharacterUserPrompt(draft: CharacterDraft): string {
  const parts: string[] = [];

  if (draft.name.trim()) parts.push(`Tên: ${draft.name.trim()}`);
  if (draft.age.trim()) parts.push(`Tuổi: ${draft.age.trim()}`);
  if (draft.gender.trim()) parts.push(`Giới tính: ${draft.gender.trim()}`);
  if (draft.species.trim()) parts.push(`Loài: ${draft.species.trim()}`);
  if (draft.description.trim()) parts.push(draft.description.trim());
  if (draft.ideaNotes?.shape?.trim()) {
    parts.push(draft.ideaNotes.shape.trim());
  }

  (Object.keys(CATEGORY_QUESTIONS) as CharacterCategoryId[]).forEach((cat) => {
    const questions = CATEGORY_QUESTIONS[cat];
    const answers = draft.categoryInputs[cat] || [];
    questions.forEach((q, i) => {
      const ans = (answers[i] || '').trim();
      if (ans && (cat === 'shape' || draft.selectedAnswerKeys?.includes(`${cat}-${i}`))) {
        parts.push(`${q.subject}: ${ans}`);
      }
    });
  });

  return parts.join('. ');
}
