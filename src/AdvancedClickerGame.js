import React, { useState, useEffect } from 'react';

const AdvancedClickerGame = () => {
  // 主要资源
  const [energy, setEnergy] = useState(0);
  const [minerals, setMinerals] = useState(0);
  const [knowledge, setKnowledge] = useState(0);
  const [prestige, setPrestige] = useState(0);
  
  // 生产率
  const [energyRate, setEnergyRate] = useState(0);
  const [mineralRate, setMineralRate] = useState(0);
  const [knowledgeRate, setKnowledgeRate] = useState(0);
  
  // 点击力量
  const [energyClickPower, setEnergyClickPower] = useState(1);
  const [mineralClickPower, setMineralClickPower] = useState(0);
  const [knowledgeClickPower, setKnowledgeClickPower] = useState(0);
  
  // 解锁状态
  const [mineralUnlocked, setMineralUnlocked] = useState(false);
  const [knowledgeUnlocked, setKnowledgeUnlocked] = useState(false);
  const [prestigeUnlocked, setPrestigeUnlocked] = useState(false);
  
  // 游戏进度和目标
  const [gameProgress, setGameProgress] = useState(0);
  const [gamePhase, setGamePhase] = useState(1);
  const MAX_PHASES = 5;
  const VICTORY_THRESHOLD = 10000000; // 1千万能量为胜利条件
  
  // 时间和事件
  const [gameTime, setGameTime] = useState(0);
  const [eventActive, setEventActive] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // 消息系统
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // 建筑和升级
  const [buildings, setBuildings] = useState({
    energyGenerators: [
      { id: 'energyGen1', name: '小型接待处', baseCost: 10, costResource: 'energy', costMultiplier: 1.2, baseProduction: 0.2, count: 0, unlocked: true, description: '每秒产生0.2金钱' },
      { id: 'energyGen2', name: '餐饮小屋', baseCost: 100, costResource: 'energy', costMultiplier: 1.3, baseProduction: 1, count: 0, unlocked: false, description: '每秒产生1金钱', requiredProgress: 5 },
      { id: 'energyGen3', name: '海景酒店', baseCost: 50, costResource: 'minerals', costMultiplier: 1.4, baseProduction: 5, count: 0, unlocked: false, description: '每秒产生5金钱', requiredResource: 'minerals', requiredAmount: 100 },
      { id: 'energyGen4', name: '豪华度假别墅', baseCost: 100, costResource: 'knowledge', costMultiplier: 1.5, baseProduction: 25, count: 0, unlocked: false, description: '每秒产生25金钱', requiredResource: 'knowledge', requiredAmount: 200 },
      { id: 'energyGen5', name: '国际连锁度假村', baseCost: 10000, costResource: 'energy', costMultiplier: 2, baseProduction: 100, count: 0, unlocked: false, description: '每秒产生100金钱', requiredPhase: 3 },
    ],
    mineralGenerators: [
      { id: 'mineralGen1', name: '建材仓库', baseCost: 50, costResource: 'energy', costMultiplier: 1.2, baseProduction: 0.5, count: 0, unlocked: false, description: '每秒产生0.5建材', requiredResource: 'energy', requiredAmount: 100 },
      { id: 'mineralGen2', name: '砂石厂', baseCost: 200, costResource: 'energy', costMultiplier: 1.3, baseProduction: 2, count: 0, unlocked: false, description: '每秒产生2建材', requiredResource: 'minerals', requiredAmount: 50 },
      { id: 'mineralGen3', name: '木材加工厂', baseCost: 100, costResource: 'minerals', costMultiplier: 1.4, baseProduction: 8, count: 0, unlocked: false, description: '每秒产生8建材', requiredPhase: 2 },
      { id: 'mineralGen4', name: '现代建材中心', baseCost: 500, costResource: 'knowledge', costMultiplier: 1.5, baseProduction: 20, count: 0, unlocked: false, description: '每秒产生20建材', requiredPhase: 3 },
    ],
    knowledgeGenerators: [
      { id: 'knowledgeGen1', name: '旅游信息中心', baseCost: 200, costResource: 'energy', costMultiplier: 1.4, baseProduction: 0.2, count: 0, unlocked: false, description: '每秒产生0.2声誉', requiredResource: 'minerals', requiredAmount: 100 },
      { id: 'knowledgeGen2', name: '特色景点', baseCost: 100, costResource: 'minerals', costMultiplier: 1.5, baseProduction: 1, count: 0, unlocked: false, description: '每秒产生1声誉', requiredResource: 'knowledge', requiredAmount: 10 },
      { id: 'knowledgeGen3', name: '五星级服务培训中心', baseCost: 50, costResource: 'knowledge', costMultiplier: 1.6, baseProduction: 3, count: 0, unlocked: false, description: '每秒产生3声誉', requiredPhase: 3 },
      { id: 'knowledgeGen4', name: '度假体验研究院', baseCost: 1000, costResource: 'knowledge', costMultiplier: 2, baseProduction: 10, count: 0, unlocked: false, description: '每秒产生10声誉', requiredPhase: 4 },
    ]
  });

  // 科技树
  const [technologies, setTechnologies] = useState([
    { id: 'tech1', name: '营销策略', cost: 20, costResource: 'energy', purchased: false, unlocked: true, effect: '点击金钱+1', effectType: 'energyClick', effectValue: 1, description: '提高金钱点击效率' },
    { id: 'tech2', name: '商业管理', cost: 100, costResource: 'energy', purchased: false, unlocked: false, effect: '金钱产量+50%', effectType: 'energyMultiplier', effectValue: 1.5, requiredTech: 'tech1', description: '提高所有金钱生产' },
    { id: 'tech3', name: '建筑规划', cost: 200, costResource: 'energy', purchased: false, unlocked: false, effect: '解锁建材资源', effectType: 'unlockResource', effectValue: 'minerals', requiredTech: 'tech2', description: '开始收集建筑材料' },
    { id: 'tech4', name: '采购渠道', cost: 50, costResource: 'minerals', purchased: false, unlocked: false, effect: '点击获得建材', effectType: 'mineralClick', effectValue: 1, requiredTech: 'tech3', description: '允许通过点击收集建材' },
    { id: 'tech5', name: '供应链优化', cost: 150, costResource: 'minerals', purchased: false, unlocked: false, effect: '建材产量+50%', effectType: 'mineralMultiplier', effectValue: 1.5, requiredTech: 'tech4', description: '提高所有建材生产' },
    { id: 'tech6', name: '品牌策略', cost: 500, costResource: 'energy', purchased: false, unlocked: false, effect: '解锁声誉资源', effectType: 'unlockResource', effectValue: 'knowledge', requiredTech: 'tech5', description: '开始积累度假村声誉' },
    { id: 'tech7', name: '客户服务', cost: 100, costResource: 'knowledge', purchased: false, unlocked: false, effect: '点击获得声誉', effectType: 'knowledgeClick', effectValue: 1, requiredTech: 'tech6', description: '允许通过点击收集声誉' },
    { id: 'tech8', name: '社交媒体宣传', cost: 200, costResource: 'knowledge', purchased: false, unlocked: false, effect: '声誉产量+50%', effectType: 'knowledgeMultiplier', effectValue: 1.5, requiredTech: 'tech7', description: '提高所有声誉生产' },
    { id: 'tech9', name: '投资者关系', cost: 2000, costResource: 'knowledge', purchased: false, unlocked: false, effect: '解锁投资重置', effectType: 'unlockPrestige', effectValue: true, requiredTech: 'tech8', description: '发现吸引新投资者并获得永久加成的方法' },
    { id: 'tech10', name: '度假村整体提升', cost: 10000, costResource: 'energy', purchased: false, unlocked: false, effect: '所有产量+100%', effectType: 'allMultiplier', effectValue: 2, requiredTech: 'tech9', description: '大幅提高所有资源产量' },
    { id: 'tech11', name: '国际扩张', cost: 50000, costResource: 'energy', purchased: false, unlocked: false, effect: '开发新度假区', effectType: 'phaseProgress', effectValue: 1, requiredTech: 'tech10', description: '扩展到新地区，接近最终胜利' },
    { id: 'tech12', name: '全球度假帝国', cost: 200000, costResource: 'energy', purchased: false, unlocked: false, effect: '获得游戏胜利', effectType: 'victory', effectValue: true, requiredTech: 'tech11', description: '完成游戏的最终目标' },
  ]);

  // 成就系统
  const [achievements, setAchievements] = useState([
    { id: 'ach1', name: '创业之路', description: '获得首笔金钱', unlocked: false, condition: 'energy', threshold: 1, reward: '金钱点击+1', rewardType: 'energyClick', rewardValue: 1 },
    { id: 'ach2', name: '精明商人', description: '累计1000金钱', unlocked: false, condition: 'energy', threshold: 1000, reward: '金钱产量+20%', rewardType: 'energyMultiplier', rewardValue: 1.2 },
    { id: 'ach3', name: '建筑新手', description: '开始收集建材', unlocked: false, condition: 'minerals', threshold: 1, reward: '建材点击+1', rewardType: 'mineralClick', rewardValue: 1 },
    { id: 'ach4', name: '建筑大师', description: '累计500建材', unlocked: false, condition: 'minerals', threshold: 500, reward: '建材产量+20%', rewardType: 'mineralMultiplier', rewardValue: 1.2 },
    { id: 'ach5', name: '口碑初现', description: '开始积累声誉', unlocked: false, condition: 'knowledge', threshold: 1, reward: '声誉点击+1', rewardType: 'knowledgeClick', rewardValue: 1 },
    { id: 'ach6', name: '知名度假胜地', description: '累计200声誉', unlocked: false, condition: 'knowledge', threshold: 200, reward: '声誉产量+20%', rewardType: 'knowledgeMultiplier', rewardValue: 1.2 },
    { id: 'ach7', name: '度假村扩建', description: '建造20座建筑', unlocked: false, condition: 'buildings', threshold: 20, reward: '所有产量+10%', rewardType: 'allMultiplier', rewardValue: 1.1 },
    { id: 'ach8', name: '创新管理', description: '研究8项技术', unlocked: false, condition: 'technologies', threshold: 8, reward: '所有点击+3', rewardType: 'allClick', rewardValue: 3 },
    { id: 'ach9', name: '投资重组', description: '进行首次投资重置', unlocked: false, condition: 'prestige', threshold: 1, reward: '开始加成+10%', rewardType: 'prestigeMultiplier', rewardValue: 1.1 },
    { id: 'ach10', name: '连锁度假村', description: '达到第3阶段', unlocked: false, condition: 'phase', threshold: 3, reward: '所有产量+30%', rewardType: 'allMultiplier', rewardValue: 1.3 },
    { id: 'ach11', name: '度假帝国', description: '完成游戏', unlocked: false, condition: 'victory', threshold: 1, reward: '游戏通关！', rewardType: 'victory', rewardValue: true },
  ]);

  // 特殊事件
  const events = [
    { id: 'event1', name: '旅游旺季', description: '金钱产量临时翻倍', duration: 30, effect: { type: 'energyMultiplier', value: 2 } },
    { id: 'event2', name: '建材大促', description: '建材产量临时翻倍', duration: 30, effect: { type: 'mineralMultiplier', value: 2 }, requiredResource: 'minerals' },
    { id: 'event3', name: '媒体报道', description: '声誉产量临时翻倍', duration: 30, effect: { type: 'knowledgeMultiplier', value: 2 }, requiredResource: 'knowledge' },
    { id: 'event4', name: '节日活动', description: '所有产量临时提高50%', duration: 20, effect: { type: 'allMultiplier', value: 1.5 }, requiredPhase: 2 },
    { id: 'event5', name: '名人光顾', description: '点击效果临时翻倍', duration: 20, effect: { type: 'clickMultiplier', value: 2 }, requiredPhase: 3 },
  ];

  // 威望系统加成
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(1);
  const [totalResets, setTotalResets] = useState(0);
  
  // 游戏状态
  const [gameWon, setGameWon] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
const [saveCode, setSaveCode] = useState("");
const [loadCode, setLoadCode] = useState("");

  // 加载提示信息
  const tutorialMessages = [
    "欢迎来到《热带天堂度假村》！这是一个模拟度假村建设与经营的游戏。",
    "首先点击金钱图标来获得金钱，这是游戏的基础资源。",
    "使用金钱购买生产建筑和研究管理技术，这将帮助你更快地发展度假村。",
    "解锁新资源和技术以推进游戏进程。你的目标是建立全球最大的度假村连锁帝国！",
    "记得查看成就标签页，完成成就可以获得强力奖励！",
    "游戏有5个阶段，通过技术树推进游戏进程，最终成为度假业的巨头！",
    "准备好了吗？开始你的度假村经营之旅吧！"
  ];
// 生成存档代码函数
const generateSaveCode = () => {
  try {
    // 创建更紧凑的存档对象，只包含必要数据
    const saveObj = {
      // 版本号
      v: 1,
      
      // 主要资源
      e: Math.floor(energy),
      m: Math.floor(minerals),
      k: Math.floor(knowledge),
      p: prestige,
      
      // 点击力量
      ec: energyClickPower,
      mc: mineralClickPower,
      kc: knowledgeClickPower,
      
      // 解锁状态 - 合并成单个数字
      u: (mineralUnlocked ? 1 : 0) + (knowledgeUnlocked ? 2 : 0) + (prestigeUnlocked ? 4 : 0),
      
      // 游戏进度
      gp: gameProgress,
      ph: gamePhase,
      gt: Math.floor(gameTime),
      
      // 建筑 - 只保存非零建筑的数量
      be: buildings.energyGenerators.map(b => b.count > 0 ? [b.id, b.count, b.unlocked ? 1 : 0] : null).filter(Boolean),
      bm: buildings.mineralGenerators.map(b => b.count > 0 ? [b.id, b.count, b.unlocked ? 1 : 0] : null).filter(Boolean),
      bk: buildings.knowledgeGenerators.map(b => b.count > 0 ? [b.id, b.count, b.unlocked ? 1 : 0] : null).filter(Boolean),
      
      // 科技 - 保存已购买科技的ID
      t: technologies.filter(t => t.purchased).map(t => t.id),
      
      // 成就 - 保存已解锁成就的ID
      a: achievements.filter(a => a.unlocked).map(a => a.id),
      
      // 已解锁但未购买的建筑
      bu: {
        be: buildings.energyGenerators.filter(b => b.unlocked && b.count === 0).map(b => b.id),
        bm: buildings.mineralGenerators.filter(b => b.unlocked && b.count === 0).map(b => b.id),
        bk: buildings.knowledgeGenerators.filter(b => b.unlocked && b.count === 0).map(b => b.id),
      },
      
      // 已解锁但未购买的科技
      tu: technologies.filter(t => t.unlocked && !t.purchased).map(t => t.id),
      
      // 威望
      pm: prestigeMultiplier,
      tr: totalResets,
      
      // 游戏状态
      w: gameWon ? 1 : 0,
    };
    
    // 转换为JSON，不含空格
    const saveJson = JSON.stringify(saveObj);
    
    // 使用Base64编码
    const result = btoa(encodeURIComponent(saveJson));
    console.log("生成存档代码成功，长度:", result.length);
    addNotification("存档代码生成成功！");
    return result;
  } catch (error) {
    console.error("生成存档代码失败:", error);
    addNotification("生成存档代码失败！");
    return "";
  }
};

// 从存档代码加载游戏
const loadSaveCode = (saveCode) => {
  try {
    // 解码
    const saveJson = decodeURIComponent(atob(saveCode));
    
    // 解析JSON
    const saveObj = JSON.parse(saveJson);
    
    // 检查版本兼容性
    if (!saveObj.v || saveObj.v !== 1) {
      addNotification("无效的存档代码或版本不兼容");
      return false;
    }
    
    // 设置所有状态变量
    // 主要资源
    setEnergy(saveObj.e || 0);
    setMinerals(saveObj.m || 0);
    setKnowledge(saveObj.k || 0);
    setPrestige(saveObj.p || 0);
    
    // 点击力量
    setEnergyClickPower(saveObj.ec || 1);
    setMineralClickPower(saveObj.mc || 0);
    setKnowledgeClickPower(saveObj.kc || 0);
    
    // 解锁状态
    const unlockFlags = saveObj.u || 0;
    setMineralUnlocked((unlockFlags & 1) !== 0);
    setKnowledgeUnlocked((unlockFlags & 2) !== 0);
    setPrestigeUnlocked((unlockFlags & 4) !== 0);
    
    // 游戏进度
    setGameProgress(saveObj.gp || 0);
    setGamePhase(saveObj.ph || 1);
    setGameTime(saveObj.gt || 0);
    
    // 建筑
    if (saveObj.be || saveObj.bm || saveObj.bk || saveObj.bu) {
      const updatedBuildings = JSON.parse(JSON.stringify(buildings)); // 深拷贝
      
      // 重置所有建筑计数和解锁状态
      Object.keys(updatedBuildings).forEach(category => {
        updatedBuildings[category].forEach((building, index) => {
          updatedBuildings[category][index].count = 0;
          updatedBuildings[category][index].unlocked = false;
        });
      });
      
      // 能量建筑
      if (saveObj.be) {
        saveObj.be.forEach(([id, count, unlocked]) => {
          const index = updatedBuildings.energyGenerators.findIndex(b => b.id === id);
          if (index !== -1) {
            updatedBuildings.energyGenerators[index].count = count;
            updatedBuildings.energyGenerators[index].unlocked = true;
          }
        });
      }
      
      // 矿物建筑
      if (saveObj.bm) {
        saveObj.bm.forEach(([id, count, unlocked]) => {
          const index = updatedBuildings.mineralGenerators.findIndex(b => b.id === id);
          if (index !== -1) {
            updatedBuildings.mineralGenerators[index].count = count;
            updatedBuildings.mineralGenerators[index].unlocked = true;
          }
        });
      }
      
      // 知识建筑
      if (saveObj.bk) {
        saveObj.bk.forEach(([id, count, unlocked]) => {
          const index = updatedBuildings.knowledgeGenerators.findIndex(b => b.id === id);
          if (index !== -1) {
            updatedBuildings.knowledgeGenerators[index].count = count;
            updatedBuildings.knowledgeGenerators[index].unlocked = true;
          }
        });
      }
      
      // 已解锁但未购买的建筑
      if (saveObj.bu) {
        if (saveObj.bu.be) {
          saveObj.bu.be.forEach(id => {
            const index = updatedBuildings.energyGenerators.findIndex(b => b.id === id);
            if (index !== -1) {
              updatedBuildings.energyGenerators[index].unlocked = true;
            }
          });
        }
        
        if (saveObj.bu.bm) {
          saveObj.bu.bm.forEach(id => {
            const index = updatedBuildings.mineralGenerators.findIndex(b => b.id === id);
            if (index !== -1) {
              updatedBuildings.mineralGenerators[index].unlocked = true;
            }
          });
        }
        
        if (saveObj.bu.bk) {
          saveObj.bu.bk.forEach(id => {
            const index = updatedBuildings.knowledgeGenerators.findIndex(b => b.id === id);
            if (index !== -1) {
              updatedBuildings.knowledgeGenerators[index].unlocked = true;
            }
          });
        }
      }
      
      setBuildings(updatedBuildings);
    }
    
    // 科技
    if (saveObj.t || saveObj.tu) {
      const updatedTechs = [...technologies];
      
      // 重置所有科技
      updatedTechs.forEach((tech, index) => {
        updatedTechs[index].purchased = false;
        updatedTechs[index].unlocked = false;
      });
      
      // 设置已购买科技
      if (saveObj.t) {
        saveObj.t.forEach(id => {
          const index = updatedTechs.findIndex(t => t.id === id);
          if (index !== -1) {
            updatedTechs[index].purchased = true;
            updatedTechs[index].unlocked = true;
          }
        });
      }
      
      // 设置已解锁但未购买的科技
      if (saveObj.tu) {
        saveObj.tu.forEach(id => {
          const index = updatedTechs.findIndex(t => t.id === id);
          if (index !== -1) {
            updatedTechs[index].unlocked = true;
          }
        });
      }
      
      setTechnologies(updatedTechs);
    }
    
    // 成就
    if (saveObj.a) {
      const updatedAchievements = [...achievements];
      
      // 重置所有成就
      updatedAchievements.forEach((achievement, index) => {
        updatedAchievements[index].unlocked = false;
      });
      
      // 设置已解锁成就
      saveObj.a.forEach(id => {
        const index = updatedAchievements.findIndex(a => a.id === id);
        if (index !== -1) {
          updatedAchievements[index].unlocked = true;
        }
      });
      
      setAchievements(updatedAchievements);
    }
    
    // 威望
    setPrestigeMultiplier(saveObj.pm || 1);
    setTotalResets(saveObj.tr || 0);
    
    // 游戏状态
    setGameWon(saveObj.w === 1);
    
    // 更新生产率
    updateProductionRates();
    
    addNotification("存档加载成功！");
    addMessage("欢迎回来！您的存档已恢复。");
    
    return true;
  } catch (error) {
    console.error("加载存档错误:", error);
    addNotification("存档加载失败！无效的存档代码。");
    return false;
  }
};

// 自动保存到localStorage
const saveToLocalStorage = () => {
  try {
    const saveCode = generateSaveCode();
    localStorage.setItem('tropicalParadiseResortSave', saveCode);
    console.log('已自动保存到本地存储');
  } catch (error) {
    console.error('自动保存失败:', error);
  }
};

// 处理存档相关操作
const handleGenerateSave = () => {
  console.log("生成存档代码按钮点击");
  const code = generateSaveCode();
  console.log("生成的代码长度:", code.length);
  setSaveCode(code);
};

const handleLoadSave = () => {
  console.log("加载存档按钮点击");
  if (loadCode.trim() === "") {
    addNotification("请输入存档代码");
    return;
  }
  
  const success = loadSaveCode(loadCode);
  if (success) {
    setSaveModalOpen(false);
  }
};

const handleCopySave = () => {
  console.log("复制存档代码按钮点击");
  if (!saveCode) {
    addNotification("没有可复制的存档代码");
    return;
  }
  
  try {
    navigator.clipboard.writeText(saveCode)
      .then(() => {
        addNotification("存档代码已复制到剪贴板！");
      })
      .catch(err => {
        console.error("无法复制到剪贴板：", err);
        addNotification("无法复制到剪贴板，请手动复制代码。");
      });
  } catch (error) {
    console.error("复制操作失败:", error);
    addNotification("复制失败，请手动选择代码并复制。");
  }
};

  // 资源点击函数
  const handleEnergyClick = () => {
    setEnergy(prev => prev + energyClickPower);
    checkAchievements();
  };

  const handleMineralClick = () => {
    if (mineralUnlocked) {
      setMinerals(prev => prev + mineralClickPower);
      checkAchievements();
    }
  };

  const handleKnowledgeClick = () => {
    if (knowledgeUnlocked) {
      setKnowledge(prev => prev + knowledgeClickPower);
      checkAchievements();
    }
  };

  // 购买建筑函数
  const buyBuilding = (type, id) => {
    const buildingCategory = type + 'Generators';
    const buildingIndex = buildings[buildingCategory].findIndex(b => b.id === id);
    const building = buildings[buildingCategory][buildingIndex];
    
    // 计算当前成本
    const cost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.count));
    const resourceKey = building.costResource;
    
    // 检查资源是否足够
    let currentResource;
    switch (resourceKey) {
      case 'energy':
        currentResource = energy;
        break;
      case 'minerals':
        currentResource = minerals;
        break;
      case 'knowledge':
        currentResource = knowledge;
        break;
      default:
        currentResource = 0;
    }
    
    if (currentResource >= cost) {
      // 扣除资源
      switch (resourceKey) {
        case 'energy':
          setEnergy(prev => prev - cost);
          break;
        case 'minerals':
          setMinerals(prev => prev - cost);
          break;
        case 'knowledge':
          setKnowledge(prev => prev - cost);
          break;
      }
      
      // 更新建筑数量
      const updatedBuildings = {...buildings};
      updatedBuildings[buildingCategory][buildingIndex].count += 1;
      setBuildings(updatedBuildings);
      
      // 更新产量
      updateProductionRates();
      
      // 添加通知
      addNotification(`购买了 ${building.name}`);
      
      // 检查成就
      const totalBuildings = countTotalBuildings();
      checkBuildingAchievements(totalBuildings);
    } else {
      addNotification(`资源不足，无法购买 ${building.name}`);
    }
  };

  // 研究科技函数
  const researchTechnology = (techId) => {
    const techIndex = technologies.findIndex(t => t.id === techId);
    const tech = technologies[techIndex];
    
    // 检查资源是否足够
    let currentResource;
    switch (tech.costResource) {
      case 'energy':
        currentResource = energy;
        break;
      case 'minerals':
        currentResource = minerals;
        break;
      case 'knowledge':
        currentResource = knowledge;
        break;
      default:
        currentResource = 0;
    }
    
    if (currentResource >= tech.cost) {
      // 扣除资源
      switch (tech.costResource) {
        case 'energy':
          setEnergy(prev => prev - tech.cost);
          break;
        case 'minerals':
          setMinerals(prev => prev - tech.cost);
          break;
        case 'knowledge':
          setKnowledge(prev => prev - tech.cost);
          break;
      }
      
      // 更新科技状态
      const updatedTechnologies = [...technologies];
      updatedTechnologies[techIndex].purchased = true;
      setTechnologies(updatedTechnologies);
      
      // 应用科技效果
      applyTechnologyEffect(tech);
      
      // 解锁依赖此科技的其他科技
      unlockDependentTechnologies(techId);
      
      // 添加通知
      addNotification(`研究完成: ${tech.name}`);
      addMessage(`新技术解锁: ${tech.name} - ${tech.description}`);
      
      // 检查成就
      const totalTechs = technologies.filter(t => t.purchased).length;
      checkTechnologyAchievements(totalTechs);
    } else {
      addNotification(`资源不足，无法研究 ${tech.name}`);
    }
  };

  // 应用科技效果
  const applyTechnologyEffect = (tech) => {
    switch (tech.effectType) {
      case 'energyClick':
        setEnergyClickPower(prev => prev + tech.effectValue);
        break;
      case 'mineralClick':
        setMineralClickPower(prev => prev + tech.effectValue);
        break;
      case 'knowledgeClick':
        setKnowledgeClickPower(prev => prev + tech.effectValue);
        break;
      case 'unlockResource':
        if (tech.effectValue === 'minerals') {
          setMineralUnlocked(true);
          setMineralClickPower(prev => prev + 1); // 初始点击力量
          // 解锁第一个矿物生产建筑
          const updatedBuildings = {...buildings};
          const mineralGenIndex = updatedBuildings.mineralGenerators.findIndex(b => b.id === 'mineralGen1');
          if (mineralGenIndex !== -1) {
            updatedBuildings.mineralGenerators[mineralGenIndex].unlocked = true;
          }
          setBuildings(updatedBuildings);
          addMessage("建材资源已解锁！现在你可以收集和使用建材。");
        } else if (tech.effectValue === 'knowledge') {
          setKnowledgeUnlocked(true);
          setKnowledgeClickPower(prev => prev + 1); // 初始点击力量
          // 解锁第一个知识生产建筑
          const updatedBuildings = {...buildings};
          const knowledgeGenIndex = updatedBuildings.knowledgeGenerators.findIndex(b => b.id === 'knowledgeGen1');
          if (knowledgeGenIndex !== -1) {
            updatedBuildings.knowledgeGenerators[knowledgeGenIndex].unlocked = true;
          }
          setBuildings(updatedBuildings);
          addMessage("声誉资源已解锁！现在你可以收集和使用声誉。");
        }
        break;
      case 'unlockPrestige':
        setPrestigeUnlocked(true);
        addMessage("投资系统已解锁！现在你可以重置游戏获得永久加成。");
        break;
      case 'phaseProgress':
        progressGamePhase();
        break;
      case 'victory':
        if (tech.effectValue) {
          achieveVictory();
        }
        break;
      default:
        // 更新生产率乘数在updateProductionRates函数中处理
        updateProductionRates();
        break;
    }
  };

  // 解锁依赖科技
  const unlockDependentTechnologies = (techId) => {
    const updatedTechnologies = [...technologies];
    let anyUnlocked = false;
    
    technologies.forEach((tech, index) => {
      if (tech.requiredTech === techId && !tech.unlocked) {
        updatedTechnologies[index].unlocked = true;
        anyUnlocked = true;
      }
    });
    
    // 科技解锁应急措施：如果没有任何科技被解锁，尝试基于资源解锁下一个科技
    if (!anyUnlocked) {
      // 研究了tech1后解锁tech2
      if (techId === 'tech1' && !updatedTechnologies.find(t => t.id === 'tech2').unlocked) {
        const techIndex = updatedTechnologies.findIndex(t => t.id === 'tech2');
        if (techIndex !== -1) {
          updatedTechnologies[techIndex].unlocked = true;
        }
      }
      
      // 解锁矿物科技
      if (techId === 'tech2' && !updatedTechnologies.find(t => t.id === 'tech3').unlocked) {
        const techIndex = updatedTechnologies.findIndex(t => t.id === 'tech3');
        if (techIndex !== -1) {
          updatedTechnologies[techIndex].unlocked = true;
        }
      }
    }
    
    setTechnologies(updatedTechnologies);
  };

  // 威望重置函数
  const performPrestigeReset = () => {
    if (!prestigeUnlocked) return;
    
    // 计算威望点数奖励（基于当前资源）
    const prestigeGain = Math.floor(Math.sqrt(energy / 1000) + Math.sqrt(minerals / 500) + Math.sqrt(knowledge / 200));
    
    if (prestigeGain < 1) {
      addNotification("资源不足，无法获得投资点数");
      return;
    }
    
    // 增加威望点数
    const newPrestige = prestige + prestigeGain;
    setPrestige(newPrestige);
    
    // 增加重置次数
    const newTotalResets = totalResets + 1;
    setTotalResets(newTotalResets);
    
    // 计算新的威望乘数
    const newMultiplier = 1 + newPrestige * 0.1; // 每点威望提供10%加成
    setPrestigeMultiplier(newMultiplier);
    
    // 重置游戏阶段和进度
    setGamePhase(1);
    setGameProgress(0);
    
    // 重置资源和生产
    setEnergy(0);
    setMinerals(0);
    setKnowledge(0);
    setEnergyRate(0);
    setMineralRate(0);
    setKnowledgeRate(0);
    
    // 保留点击力量的一部分
    setEnergyClickPower(1 + Math.floor((energyClickPower - 1) * 0.2)); // 保留20%
    setMineralClickPower(Math.floor(mineralClickPower * 0.2)); // 保留20%
    setKnowledgeClickPower(Math.floor(knowledgeClickPower * 0.2)); // 保留20%
    
    // 重置建筑
    const resetBuildings = JSON.parse(JSON.stringify(buildings)); // 深拷贝
    Object.keys(resetBuildings).forEach(category => {
      resetBuildings[category].forEach((building, index) => {
        resetBuildings[category][index].count = 0;
      });
    });
    setBuildings(resetBuildings);
    
    // 重置科技，但保留特定科技
    const resetTechnologies = [...technologies];
    resetTechnologies.forEach((tech, index) => {
      // 保留解锁资源和威望的科技
      if (tech.effectType === 'unlockResource' || tech.effectType === 'unlockPrestige') {
        // 这些保持购买状态
      } else {
        resetTechnologies[index].purchased = false;
        // 如果是第一个科技，确保它被解锁
        if (index === 0) {
          resetTechnologies[index].unlocked = true;
        } else {
          // 重置其他科技的解锁状态，除非它们依赖于已购买的科技
          const requiredTech = tech.requiredTech;
          const requiredTechPurchased = resetTechnologies.find(t => t.id === requiredTech)?.purchased || false;
          resetTechnologies[index].unlocked = requiredTechPurchased;
        }
      }
    });
    setTechnologies(resetTechnologies);
    
    // 添加消息
    addNotification(`投资重置完成！获得了${prestigeGain}点投资`);
    addMessage(`新的开始！投资加成现在是${Math.round((newMultiplier - 1) * 100)}%`);
    
    // 检查成就
    checkPrestigeAchievements(newTotalResets);
  };

  // 进度阶段函数
  const progressGamePhase = () => {
    if (gamePhase < MAX_PHASES) {
      const newPhase = gamePhase + 1;
      setGamePhase(newPhase);
      
      // 解锁新阶段的建筑和科技
      unlockPhaseContent(newPhase);
      
      // 增加游戏进度
      setGameProgress(prev => prev + 20); // 每个阶段增加20%进度
      
      // 添加消息
      addNotification(`进入游戏第${newPhase}阶段！`);
      addMessage(`恭喜！你的度假村已进入第${newPhase}阶段。新的建筑和技术已解锁！`);
      
      // 检查成就
      checkPhaseAchievements(newPhase);
    }
  };

  // 解锁新阶段内容
  const unlockPhaseContent = (phase) => {
    // 解锁建筑
    const updatedBuildings = {...buildings};
    Object.keys(updatedBuildings).forEach(category => {
      updatedBuildings[category].forEach((building, index) => {
        if (building.requiredPhase === phase) {
          updatedBuildings[category][index].unlocked = true;
        }
      });
    });
    setBuildings(updatedBuildings);
    
    // 解锁科技
    const updatedTechnologies = [...technologies];
    technologies.forEach((tech, index) => {
      if (tech.requiredPhase === phase) {
        updatedTechnologies[index].unlocked = true;
      }
    });
    setTechnologies(updatedTechnologies);
  };

  // 胜利条件检查
  const checkVictoryCondition = () => {
    // 如果已经赢了，不再检查
    if (gameWon) return;
    
    // 检查能量是否达到胜利阈值
    if (energy >= VICTORY_THRESHOLD) {
      // 检查是否研究了最终科技
      const victoryTech = technologies.find(t => t.effectType === 'victory');
      if (victoryTech && victoryTech.purchased) {
        achieveVictory();
      }
    }
  };

  // 获得游戏胜利
  const achieveVictory = () => {
    if (gameWon) return; // 避免重复触发
    
    setGameWon(true);
    
    // 解锁胜利成就
    const updatedAchievements = [...achievements];
    const victoryAchIndex = updatedAchievements.findIndex(a => a.condition === 'victory');
    if (victoryAchIndex !== -1) {
      updatedAchievements[victoryAchIndex].unlocked = true;
    }
    setAchievements(updatedAchievements);
    
    // 显示胜利消息
    addNotification("恭喜！你已经完成了游戏！");
    addMessage("度假帝国之王！你已经成功建立了全球最大的度假村连锁集团。现在你可以继续游戏探索更多内容，或者开始新的征程。");
    
    // 停止所有生产和资源累积（通过设置一个游戏暂停状态）
    // 注意：这不会真正停止计时器，但会防止资源计算
  };

  // 触发随机事件
  const triggerRandomEvent = () => {
    if (eventActive || Math.random() > 0.1) return; // 10%几率触发事件
    
    // 筛选可用事件
    const availableEvents = events.filter(event => {
      if (event.requiredResource === 'minerals' && !mineralUnlocked) return false;
      if (event.requiredResource === 'knowledge' && !knowledgeUnlocked) return false;
      if (event.requiredPhase && gamePhase < event.requiredPhase) return false;
      return true;
    });
    
    if (availableEvents.length === 0) return;
    
    // 随机选择一个事件
    const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    setCurrentEvent(randomEvent);
    setEventActive(true);
    
    // 添加消息
    addNotification(`特殊事件：${randomEvent.name}`);
    addMessage(`特殊事件触发：${randomEvent.name} - ${randomEvent.description}，持续${randomEvent.duration}秒`);
    
    // 设置事件结束定时器
    setTimeout(() => {
      setEventActive(false);
      setCurrentEvent(null);
      addNotification(`事件结束：${randomEvent.name}`);
    }, randomEvent.duration * 1000);
  };

  // 资源自动生产
  useEffect(() => {
    const productionInterval = setInterval(() => {
      // 如果游戏已赢，不再处理资源生产
      if (gameWon) return;
      
      // 更新资源
      setEnergy(prev => prev + energyRate / 10);
      if (mineralUnlocked) {
        setMinerals(prev => prev + mineralRate / 10);
      }
      if (knowledgeUnlocked) {
        setKnowledge(prev => prev + knowledgeRate / 10);
      }
      
      // 更新游戏时间
      setGameTime(prev => prev + 0.1);
      
      // 检查建筑和科技的解锁条件
      checkUnlockConditions();
      
      // 检查成就
      checkAchievements();
      
      // 检查胜利条件
      checkVictoryCondition();
      
    }, 100); // 每0.1秒更新一次
    
    return () => clearInterval(productionInterval);
  }, [energyRate, mineralRate, knowledgeRate, mineralUnlocked, knowledgeUnlocked, gameWon]);

  // 随机事件触发检查
  useEffect(() => {
    const eventCheckInterval = setInterval(() => {
      triggerRandomEvent();
    }, 10000); // 每10秒检查一次
    
    return () => clearInterval(eventCheckInterval);
  }, [eventActive, mineralUnlocked, knowledgeUnlocked, gamePhase]);

  // 更新生产率
  const updateProductionRates = () => {
    // 计算基础产量
    let baseEnergyRate = 0;
    let baseMineralRate = 0;
    let baseKnowledgeRate = 0;
    
    buildings.energyGenerators.forEach(gen => {
      if (gen.count > 0) {
        baseEnergyRate += gen.baseProduction * gen.count;
      }
    });
    
    buildings.mineralGenerators.forEach(gen => {
      if (gen.count > 0) {
        baseMineralRate += gen.baseProduction * gen.count;
      }
    });
    
    buildings.knowledgeGenerators.forEach(gen => {
      if (gen.count > 0) {
        baseKnowledgeRate += gen.baseProduction * gen.count;
      }
    });
    
    // 应用乘数效果
    let energyMultiplier = 1;
    let mineralMultiplier = 1;
    let knowledgeMultiplier = 1;
    let allMultiplier = 1;
    
    // 应用科技效果
    technologies.forEach(tech => {
      if (tech.purchased) {
        switch (tech.effectType) {
          case 'energyMultiplier':
            energyMultiplier *= tech.effectValue;
            break;
          case 'mineralMultiplier':
            mineralMultiplier *= tech.effectValue;
            break;
          case 'knowledgeMultiplier':
            knowledgeMultiplier *= tech.effectValue;
            break;
          case 'allMultiplier':
            allMultiplier *= tech.effectValue;
            break;
        }
      }
    });
    
    // 应用成就奖励
    achievements.forEach(achievement => {
      if (achievement.unlocked) {
        switch (achievement.rewardType) {
          case 'energyMultiplier':
            energyMultiplier *= achievement.rewardValue;
            break;
          case 'mineralMultiplier':
            mineralMultiplier *= achievement.rewardValue;
            break;
          case 'knowledgeMultiplier':
            knowledgeMultiplier *= achievement.rewardValue;
            break;
          case 'allMultiplier':
            allMultiplier *= achievement.rewardValue;
            break;
        }
      }
    });
    
    // 应用威望加成
    allMultiplier *= prestigeMultiplier;
    
    // 应用事件效果
    if (eventActive && currentEvent) {
      switch (currentEvent.effect.type) {
        case 'energyMultiplier':
          energyMultiplier *= currentEvent.effect.value;
          break;
        case 'mineralMultiplier':
          mineralMultiplier *= currentEvent.effect.value;
          break;
        case 'knowledgeMultiplier':
          knowledgeMultiplier *= currentEvent.effect.value;
          break;
        case 'allMultiplier':
          allMultiplier *= currentEvent.effect.value;
          break;
      }
    }
    
    // 计算最终产量
    setEnergyRate(baseEnergyRate * energyMultiplier * allMultiplier);
    setMineralRate(baseMineralRate * mineralMultiplier * allMultiplier);
    setKnowledgeRate(baseKnowledgeRate * knowledgeMultiplier * allMultiplier);
  };

  // 应用点击乘数
  const getClickMultiplier = () => {
    let clickMultiplier = 1;
    
    // 应用事件效果
    if (eventActive && currentEvent && currentEvent.effect.type === 'clickMultiplier') {
      clickMultiplier *= currentEvent.effect.value;
    }
    
    return clickMultiplier;
  };

  // 检查解锁条件
  const checkUnlockConditions = () => {
    // 检查建筑解锁条件
    const updatedBuildings = {...buildings};
    let buildingsChanged = false;
    
    Object.keys(updatedBuildings).forEach(category => {
      updatedBuildings[category].forEach((building, index) => {
        if (!building.unlocked) {
          // 检查进度要求
          if (building.requiredProgress && gameProgress >= building.requiredProgress) {
            updatedBuildings[category][index].unlocked = true;
            buildingsChanged = true;
          }
          
          // 检查资源要求
          if (building.requiredResource && building.requiredAmount) {
            let resourceAmount = 0;
            switch (building.requiredResource) {
              case 'energy':
                resourceAmount = energy;
                break;
              case 'minerals':
                resourceAmount = minerals;
                break;
              case 'knowledge':
                resourceAmount = knowledge;
                break;
            }
            
            if (resourceAmount >= building.requiredAmount) {
              updatedBuildings[category][index].unlocked = true;
              buildingsChanged = true;
            }
          }
        }
      });
    });
    
    if (buildingsChanged) {
      setBuildings(updatedBuildings);
    }
    
    // 检查第二级能量生成器解锁
    if (!buildings.energyGenerators[1].unlocked && energy >= 50) {
      const newBuildings = {...buildings};
      newBuildings.energyGenerators[1].unlocked = true;
      setBuildings(newBuildings);
    }
    
    // 检查科技解锁
    const techs = [...technologies];
    let techsChanged = false;
    
    // 检查第一个科技是否需要自动解锁
    if (!techs[0].unlocked && energy >= 10) {
      techs[0].unlocked = true;
      techsChanged = true;
    }
    
    if (techsChanged) {
      setTechnologies(techs);
    }
  };

  // 检查成就
  const checkAchievements = () => {
    const updatedAchievements = [...achievements];
    let achievementsChanged = false;
    
    updatedAchievements.forEach((achievement, index) => {
      if (!achievement.unlocked) {
        let conditionMet = false;
        
        switch (achievement.condition) {
          case 'energy':
            conditionMet = energy >= achievement.threshold;
            break;
          case 'minerals':
            conditionMet = minerals >= achievement.threshold;
            break;
          case 'knowledge':
            conditionMet = knowledge >= achievement.threshold;
            break;
          // 其他成就类型在专门的函数中检查
        }
        
        if (conditionMet) {
          updatedAchievements[index].unlocked = true;
          achievementsChanged = true;
          applyAchievementReward(achievement);
          addNotification(`成就解锁：${achievement.name}`);
          addMessage(`新成就解锁：${achievement.name} - ${achievement.description}，奖励：${achievement.reward}`);
          
          // 立即检查是否已达到能量大师成就条件
          if (achievement.id === 'ach1' && energy >= 1000) {
            const energyMasterIndex = updatedAchievements.findIndex(a => a.id === 'ach2');
            if (energyMasterIndex !== -1 && !updatedAchievements[energyMasterIndex].unlocked) {
              updatedAchievements[energyMasterIndex].unlocked = true;
              applyAchievementReward(updatedAchievements[energyMasterIndex]);
              addNotification(`成就解锁：${updatedAchievements[energyMasterIndex].name}`);
              addMessage(`新成就解锁：${updatedAchievements[energyMasterIndex].name} - ${updatedAchievements[energyMasterIndex].description}，奖励：${updatedAchievements[energyMasterIndex].reward}`);
            }
          }
        }
      }
    });
    
    if (achievementsChanged) {
      setAchievements(updatedAchievements);
    }
  };

  // 检查建筑成就
  const checkBuildingAchievements = (totalBuildings) => {
    const updatedAchievements = [...achievements];
    let achievementsChanged = false;
    
    updatedAchievements.forEach((achievement, index) => {
      if (!achievement.unlocked && achievement.condition === 'buildings' && totalBuildings >= achievement.threshold) {
        updatedAchievements[index].unlocked = true;
        achievementsChanged = true;
        applyAchievementReward(achievement);
        addNotification(`成就解锁：${achievement.name}`);
        addMessage(`新成就解锁：${achievement.name} - ${achievement.description}，奖励：${achievement.reward}`);
      }
    });
    
    if (achievementsChanged) {
      setAchievements(updatedAchievements);
    }
  };

  // 检查科技成就
  const checkTechnologyAchievements = (totalTechs) => {
    const updatedAchievements = [...achievements];
    let achievementsChanged = false;
    
    updatedAchievements.forEach((achievement, index) => {
      if (!achievement.unlocked && achievement.condition === 'technologies' && totalTechs >= achievement.threshold) {
        updatedAchievements[index].unlocked = true;
        achievementsChanged = true;
        applyAchievementReward(achievement);
        addNotification(`成就解锁：${achievement.name}`);
        addMessage(`新成就解锁：${achievement.name} - ${achievement.description}，奖励：${achievement.reward}`);
      }
    });
    
    if (achievementsChanged) {
      setAchievements(updatedAchievements);
    }
  };

  // 检查威望成就
  const checkPrestigeAchievements = (totalResets) => {
    const updatedAchievements = [...achievements];
    let achievementsChanged = false;
    
    updatedAchievements.forEach((achievement, index) => {
      if (!achievement.unlocked && achievement.condition === 'prestige' && totalResets >= achievement.threshold) {
        updatedAchievements[index].unlocked = true;
        achievementsChanged = true;
        applyAchievementReward(achievement);
        addNotification(`成就解锁：${achievement.name}`);
        addMessage(`新成就解锁：${achievement.name} - ${achievement.description}，奖励：${achievement.reward}`);
      }
    });
    
    if (achievementsChanged) {
      setAchievements(updatedAchievements);
    }
  };

  // 检查阶段成就
  const checkPhaseAchievements = (phase) => {
    const updatedAchievements = [...achievements];
    let achievementsChanged = false;
    
    updatedAchievements.forEach((achievement, index) => {
      if (!achievement.unlocked && achievement.condition === 'phase' && phase >= achievement.threshold) {
        updatedAchievements[index].unlocked = true;
        achievementsChanged = true;
        applyAchievementReward(achievement);
        addNotification(`成就解锁：${achievement.name}`);
        addMessage(`新成就解锁：${achievement.name} - ${achievement.description}，奖励：${achievement.reward}`);
      }
    });
    
    if (achievementsChanged) {
      setAchievements(updatedAchievements);
    }
  };

  // 应用成就奖励
  const applyAchievementReward = (achievement) => {
    switch (achievement.rewardType) {
      case 'energyClick':
        setEnergyClickPower(prev => prev + achievement.rewardValue);
        break;
      case 'mineralClick':
        setMineralClickPower(prev => prev + achievement.rewardValue);
        break;
      case 'knowledgeClick':
        setKnowledgeClickPower(prev => prev + achievement.rewardValue);
        break;
      case 'allClick':
        setEnergyClickPower(prev => prev + achievement.rewardValue);
        setMineralClickPower(prev => prev + achievement.rewardValue);
        setKnowledgeClickPower(prev => prev + achievement.rewardValue);
        break;
      // 生产率乘数在updateProductionRates中处理
    }
    
    // 更新生产率
    updateProductionRates();
  };

  // 计算总建筑数
  const countTotalBuildings = () => {
    let total = 0;
    Object.keys(buildings).forEach(category => {
      buildings[category].forEach(building => {
        total += building.count;
      });
    });
    return total;
  };

  // 添加游戏消息
  const addMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      text: message,
      time: gameTime.toFixed(1)
    };
    setMessages(prev => [newMessage, ...prev].slice(0, 50)); // 保留最新的50条消息
  };

  // 添加临时通知
  const addNotification = (text) => {
    const newNotification = {
      id: Date.now(),
      text
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // 3秒后移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 3000);
  };

  // 格式化大数字
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else {
      return Math.floor(num);
    }
  };

  // 计算建筑成本
  const calculateBuildingCost = (building) => {
    return Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.count));
  };

  // 计算重置获得的威望
  const calculatePrestigeGain = () => {
    // 确保非负数值
    const energyValue = Math.max(0, energy);
    const mineralsValue = Math.max(0, minerals);
    const knowledgeValue = Math.max(0, knowledge);
    
    // 修正计算方式，避免负数或NaN结果
    const energyComponent = energyValue > 0 ? Math.sqrt(energyValue / 1000) : 0;
    const mineralsComponent = mineralsValue > 0 ? Math.sqrt(mineralsValue / 500) : 0;
    const knowledgeComponent = knowledgeValue > 0 ? Math.sqrt(knowledgeValue / 200) : 0;
    
    // 确保结果是有效数字
    const result = Math.floor(energyComponent + mineralsComponent + knowledgeComponent) || 0;
    return Math.max(0, result);
  };

  // 推进教程
  const advanceTutorial = () => {
    if (tutorialStep < tutorialMessages.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
    }
  };

  // 自动更新生产率（当相关状态改变时）
  useEffect(() => {
    updateProductionRates();
  }, [buildings, technologies, achievements, prestige, eventActive, currentEvent]);

  // 初始化钩子
  useEffect(() => {
    // 初始消息
    addMessage("欢迎来到《热带天堂度假村》！点击金钱图标开始你的度假村建设之旅。");
    
    // 确保第一个科技已解锁
    const techs = [...technologies];
    if (!techs[0].unlocked) {
      techs[0].unlocked = true;
      setTechnologies(techs);
    }
    
    // 确保第一个能量生产建筑已解锁
    const updatedBuildings = {...buildings};
    if (!updatedBuildings.energyGenerators[0].unlocked) {
      updatedBuildings.energyGenerators[0].unlocked = true;
      setBuildings(updatedBuildings);
    }
  }, []);
// 游戏开始时从localStorage加载
useEffect(() => {
  try {
    const savedCode = localStorage.getItem('tropicalParadiseResortSave');
    if (savedCode) {
      loadSaveCode(savedCode);
    }
  } catch (error) {
    console.error('从本地存储加载失败:', error);
  }
}, []);

// 设置每5分钟自动保存
useEffect(() => {
  const autoSaveInterval = setInterval(() => {
    saveToLocalStorage();
  }, 5 * 60 * 1000); // 5分钟
  
  return () => clearInterval(autoSaveInterval);
}, []);

  // 渲染建筑列表
  const renderBuildings = (category) => {
    const buildingList = buildings[category + 'Generators'].filter(b => b.unlocked);
    
    if (buildingList.length === 0) {
      return <div className="text-gray-400 text-center">尚未解锁建筑</div>;
    }
    
    return buildingList.map(building => {
      const cost = calculateBuildingCost(building);
      let canAfford = false;
      let resourceIcon = '';
      
      switch (building.costResource) {
        case 'energy':
          canAfford = energy >= cost;
          resourceIcon = '💰';
          break;
        case 'minerals':
          canAfford = minerals >= cost;
          resourceIcon = '🧱';
          break;
        case 'knowledge':
          canAfford = knowledge >= cost;
          resourceIcon = '⭐';
          break;
      }
      
      return (
        <div key={building.id} className="bg-gray-700 p-3 rounded-lg mb-2 flex justify-between items-center">
          <div>
            <div className="font-bold text-lg flex items-center">
              {building.name} <span className="ml-2 bg-blue-600 rounded-full px-2 py-0.5 text-xs">Lv.{building.count}</span>
            </div>
            <div className="text-sm text-gray-300">{building.description}</div>
            <div className="text-xs text-green-400">产量: +{formatNumber(building.baseProduction)}/秒</div>
          </div>
          <button
            className={`px-3 py-2 rounded-md flex items-center ${canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
            onClick={() => buyBuilding(category, building.id)}
            disabled={!canAfford}
          >
            {resourceIcon} {formatNumber(cost)}
          </button>
        </div>
      );
    });
  };

  // 渲染科技列表
  const renderTechnologies = () => {
    const availableTechs = technologies.filter(t => t.unlocked && !t.purchased);
    
    if (availableTechs.length === 0) {
      return <div className="text-gray-400 text-center">当前没有可研究的技术</div>;
    }
    
    return availableTechs.map(tech => {
      let canAfford = false;
      let resourceIcon = '';
      
      switch (tech.costResource) {
        case 'energy':
          canAfford = energy >= tech.cost;
          resourceIcon = '💰';
          break;
        case 'minerals':
          canAfford = minerals >= tech.cost;
          resourceIcon = '🧱';
          break;
        case 'knowledge':
          canAfford = knowledge >= tech.cost;
          resourceIcon = '⭐';
          break;
      }
      
      return (
        <div key={tech.id} className="bg-gray-700 p-3 rounded-lg mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-lg">{tech.name}</div>
            <button
              className={`px-3 py-1 rounded-md flex items-center ${canAfford ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 cursor-not-allowed'}`}
              onClick={() => researchTechnology(tech.id)}
              disabled={!canAfford}
            >
              {resourceIcon} {formatNumber(tech.cost)}
            </button>
          </div>
          <div className="text-sm text-gray-300">{tech.description}</div>
          <div className="text-xs text-purple-400 mt-1">效果: {tech.effect}</div>
        </div>
      );
    });
  };

  // 渲染成就列表
  const renderAchievements = () => {
    return achievements.map(achievement => (
      <div 
        key={achievement.id} 
        className={`p-3 rounded-lg mb-2 ${achievement.unlocked ? 'bg-blue-800' : 'bg-gray-700'}`}
      >
        <div className="font-bold">
          {achievement.unlocked ? '✅ ' : '🔒 '}{achievement.name}
        </div>
        <div className="text-sm text-gray-300">{achievement.description}</div>
        <div className="text-xs text-yellow-400 mt-1">奖励: {achievement.reward}</div>
      </div>
    ));
  };

  // 渲染威望重置信息
  const renderPrestigeInfo = () => {
    if (!prestigeUnlocked) {
      return (
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <div className="font-bold text-lg mb-2">投资系统</div>
          <div className="text-gray-300">
            研究"投资者关系"技术以解锁投资重置功能。
          </div>
        </div>
      );
    }
    
    const prestigeGain = calculatePrestigeGain();
    
    return (
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <div className="font-bold text-lg mb-2">投资重置</div>
        <div className="text-gray-300 mb-2">
          通过重置游戏进度，你可以获得永久性加成。当前加成：{Math.round((prestigeMultiplier - 1) * 100)}%
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-yellow-400">当前投资：{prestige}</div>
            <div className="text-green-400">重置可获得：+{prestigeGain} 点投资</div>
          </div>
          <button
            className={`px-4 py-2 rounded-md ${prestigeGain > 0 ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 cursor-not-allowed'}`}
            onClick={() => prestigeGain >= 1 && performPrestigeReset()}
            disabled={prestigeGain < 1}
          >
            重置
          </button>
        </div>
      </div>
    )
  }

  // 渲染消息日志
  const renderMessages = () => {
    if (messages.length === 0) {
      return <div className="text-gray-400 text-center">没有消息</div>;
    }
    
    return messages.map(message => (
      <div key={message.id} className="border-b border-gray-700 py-2">
        <div className="text-xs text-gray-400 mb-1">[{message.time}s]</div>
        <div>{message.text}</div>
      </div>
    ));
  };

  // 渲染通知
  const renderNotifications = () => {
    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="bg-blue-900 px-4 py-2 rounded-md shadow-lg animate-fade-in"
          >
            {notification.text}
          </div>
        ))}
      </div>
    )
  }

  // 渲染游戏状态
  const renderGameStatus = () => {
    // 计算基于当前游戏阶段的进度，每个阶段20%
    const phaseProgress = (gamePhase - 1) * 20;
    
    // 计算当前阶段内的进度（基于科技解锁情况）
    const techsForCurrentPhase = technologies.filter(t => 
      // 为每个阶段分组技术
      Math.ceil((technologies.indexOf(t) + 1) / (technologies.length / MAX_PHASES)) === gamePhase
    );
    
    const unlockedTechsForPhase = techsForCurrentPhase.filter(t => t.purchased).length;
    const totalTechsForPhase = techsForCurrentPhase.length || 1; // 避免除以零
    
    // 当前阶段内的进度百分比（0-20%）
    const currentPhaseProgress = Math.floor((unlockedTechsForPhase / totalTechsForPhase) * 20);
    
    // 总进度 = 之前阶段 + 当前阶段内进度
    const totalProgress = Math.min(phaseProgress + currentPhaseProgress, 100);
    
    // 更新游戏进度
    if (totalProgress !== gameProgress) {
      setGameProgress(totalProgress);
    }
    
    return (
      <div className="bg-gray-800 p-2 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm">度假村等级: {gamePhase}/{MAX_PHASES}</div>
            <div className="text-sm">发展进度: {totalProgress}%</div>
          </div>
          <div className="text-sm">经营时间: {gameTime.toFixed(0)}秒</div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
      </div>
    )
  }

  // 渲染事件信息
  const renderEventInfo = () => {
    if (!eventActive || !currentEvent) return null;
    
    return (
      <div className="bg-purple-900 p-2 rounded-lg mb-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="font-bold">特殊事件: {currentEvent.name}</div>
        </div>
        <div className="text-sm">{currentEvent.description}</div>
      </div>
    )
  }

  // 渲染教程
  const renderTutorial = () => {
    if (!showTutorial) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md">
          <div className="text-xl font-bold mb-4">教程</div>
          <div className="mb-4">{tutorialMessages[tutorialStep]}</div>
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              onClick={() => setShowTutorial(false)}
            >
              跳过
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={advanceTutorial}
            >
              {tutorialStep < tutorialMessages.length - 1 ? '下一步' : '开始游戏'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 胜利屏幕组件
  const VictoryScreen = React.memo(({ gameTime, prestige, totalResets, achievements, gameWon, setGameWon, performPrestigeReset }) => {
    if (!gameWon) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
          <div className="text-yellow-400 text-3xl font-bold mb-4">恭喜！游戏通关！</div>
          <div className="text-xl mb-6">你已成功建立全球顶级度假村连锁帝国！</div>
          <div className="mb-4">
            <div>总游戏时间: {gameTime.toFixed(0)}秒</div>
            <div>投资点数: {prestige}</div>
            <div>重置次数: {totalResets}</div>
            <div>解锁成就: {achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
          </div>
          <div className="mb-6">你可以继续游戏探索更多内容，或者开始新的征程。</div>
          <div className="flex justify-center space-x-4">
            <button 
              className="px-4 py-2 bg-yellow-600 rounded-md hover:bg-yellow-700"
              onClick={() => setGameWon(false)}
            >
              继续游戏
            </button>
            <button 
              className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
              onClick={performPrestigeReset}
            >
              投资重置
            </button>
          </div>
        </div>
      </div>
    )
  });
  const SaveLoadModal = ({ saveModalOpen, setSaveModalOpen, saveCode, setSaveCode, loadCode, setLoadCode, handleGenerateSave, handleLoadSave, handleCopySave }) => {
    if (!saveModalOpen) return null;
    
    // Close modal when clicking outside
    const handleBackgroundClick = () => {
      setSaveModalOpen(false);
    };
    
    // Prevent clicks inside the modal from closing it
    const handleModalClick = (e) => {
      e.stopPropagation();
    };
    
    return (
      // The outer div is the background overlay
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={handleBackgroundClick}
      >
        {/* The inner div is the modal content */}
        <div 
          className="bg-gray-800 p-6 rounded-lg max-w-lg w-full" 
          onClick={handleModalClick}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold">游戏存档</div>
            <button 
              className="text-gray-400 hover:text-white text-xl px-2"
              onClick={() => setSaveModalOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">保存游戏</h3>
            <div className="flex mb-2">
              <button 
                className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 mr-2"
                onClick={handleGenerateSave}
                type="button"
              >
                生成存档代码
              </button>
              {saveCode && (
                <button 
                  className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
                  onClick={handleCopySave}
                  type="button"
                >
                  复制到剪贴板
                </button>
              )}
            </div>
            {saveCode && (
              <div className="bg-gray-900 p-2 rounded-md overflow-x-auto mt-2">
                <code className="text-xs break-all select-all">{saveCode}</code>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">加载游戏</h3>
            <textarea
              className="w-full p-2 bg-gray-900 rounded-md text-white mb-2 text-sm"
              placeholder="输入存档代码..."
              rows={4}
              value={loadCode}
              onChange={(e) => setLoadCode(e.target.value)}
            ></textarea>
            <button 
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 w-full"
              onClick={handleLoadSave}
              disabled={!loadCode.trim()}
              type="button"
            >
              加载存档
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  
  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      {/* 游戏状态和事件信息 */}
      {renderGameStatus()}
      {renderEventInfo()}
      
      {/* 资源面板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-800 p-4 rounded-lg flex flex-col items-center cursor-pointer transform transition-all hover:scale-105" onClick={handleEnergyClick}>
          <div className="text-2xl mb-2">💰 金钱</div>
          <div className="text-3xl font-bold">{formatNumber(energy)}</div>
          <div className="text-sm">+{formatNumber(energyRate)}/秒</div>
          <div className="text-xs">点击: +{formatNumber(energyClickPower * getClickMultiplier())}</div>
        </div>
        
        {mineralUnlocked && (
          <div className="bg-orange-800 p-4 rounded-lg flex flex-col items-center cursor-pointer transform transition-all hover:scale-105" onClick={handleMineralClick}>
            <div className="text-2xl mb-2">🧱 建材</div>
            <div className="text-3xl font-bold">{formatNumber(minerals)}</div>
            <div className="text-sm">+{formatNumber(mineralRate)}/秒</div>
            <div className="text-xs">点击: +{formatNumber(mineralClickPower * getClickMultiplier())}</div>
          </div>
        )}
        
        {knowledgeUnlocked && (
          <div className="bg-blue-800 p-4 rounded-lg flex flex-col items-center cursor-pointer transform transition-all hover:scale-105" onClick={handleKnowledgeClick}>
            <div className="text-2xl mb-2">⭐ 声誉</div>
            <div className="text-3xl font-bold">{formatNumber(knowledge)}</div>
            <div className="text-sm">+{formatNumber(knowledgeRate)}/秒</div>
            <div className="text-xs">点击: +{formatNumber(knowledgeClickPower * getClickMultiplier())}</div>
          </div>
        )}
        
        {prestigeUnlocked && (
          <div className="bg-purple-800 p-4 rounded-lg flex flex-col items-center">
            <div className="text-2xl mb-2">💼 投资</div>
            <div className="text-3xl font-bold">{prestige}</div>
            <div className="text-sm">加成: +{Math.round((prestigeMultiplier - 1) * 100)}%</div>
          </div>
        )}
      </div>
      
      {/* 选项卡导航 */}
      <div className="flex mb-4 overflow-x-auto">
        <button
          className={`px-4 py-2 mr-2 rounded-md transition-colors ${activeTab === 'main' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('main')}
        >
          建筑
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-md transition-colors ${activeTab === 'research' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('research')}
        >
          研究
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-md transition-colors ${activeTab === 'achievements' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('achievements')}
        >
          成就
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-md transition-colors ${activeTab === 'prestige' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('prestige')}
        >
          投资
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'log' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('log')}
        >
          日志
        </button>
        <button
  className="px-4 py-2 mr-2 rounded-md transition-colors bg-yellow-800 hover:bg-yellow-700"
  onClick={() => setSaveModalOpen(true)}
>
  存档
</button>
      </div>
      
      {/* 选项卡内容 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        {activeTab === 'main' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">收入建筑</h2>
              {renderBuildings('energy')}
            </div>
            
            {mineralUnlocked && (
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">建材生产</h2>
                {renderBuildings('mineral')}
              </div>
            )}
            
            {knowledgeUnlocked && (
              <div>
                <h2 className="text-xl font-bold mb-2">声誉提升</h2>
                {renderBuildings('knowledge')}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'research' && (
          <div>
            <h2 className="text-xl font-bold mb-2">可用技术</h2>
            {renderTechnologies()}
            
            {technologies.some(t => t.purchased) && (
              <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">已研究技术</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {technologies.filter(t => t.purchased).map(tech => (
                    <div key={tech.id} className="bg-gray-700 p-2 rounded-lg">
                      <div className="font-bold">{tech.name}</div>
                      <div className="text-xs text-gray-400">{tech.effect}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-xl font-bold mb-2">成就</h2>
            <div className="text-sm text-gray-400 mb-4">
              解锁成就: {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
            {renderAchievements()}
          </div>
        )}
        
        {activeTab === 'prestige' && (
          <div>
            <h2 className="text-xl font-bold mb-2">投资系统</h2>
            {renderPrestigeInfo()}
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="font-bold text-lg mb-2">投资机制说明</div>
              <div className="text-gray-300 space-y-2">
                <p>投资重置会让你失去大部分游戏进度，但会提供永久性的全局资源产量加成。</p>
                <p>每点投资提供10%的资源产量加成。重置时获得的投资点数基于当前资源量。</p>
                <p>重置后，你将保留:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>20%的点击力量</li>
                  <li>解锁的资源类型</li>
                  <li>解锁的投资系统</li>
                  <li>所有成就</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'log' && (
          <div>
            <h2 className="text-xl font-bold mb-2">游戏日志</h2>
            <div className="h-80 overflow-y-auto bg-gray-900 p-2 rounded-lg">
              {renderMessages()}
            </div>
          </div>
        )}
      </div>
      
      {/* 通知系统 */}
      {renderNotifications()}
      
      {/* 教程 */}
      {renderTutorial()}
      
      {/* 胜利屏幕 */}
      <VictoryScreen 
        gameTime={gameTime}
        prestige={prestige}
        totalResets={totalResets}
        achievements={achievements}
        gameWon={gameWon}
        setGameWon={setGameWon}
        performPrestigeReset={performPrestigeReset}
      />
       {/* 存档对话框 */}
       <SaveLoadModal 
         saveModalOpen={saveModalOpen}
         setSaveModalOpen={setSaveModalOpen}
         saveCode={saveCode}
         setSaveCode={setSaveCode}
         loadCode={loadCode}
         setLoadCode={setLoadCode}
         handleGenerateSave={handleGenerateSave}
         handleLoadSave={handleLoadSave}
         handleCopySave={handleCopySave}
       />
    </div>
  );
};

export default AdvancedClickerGame;