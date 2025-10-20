import React from 'react';
import { ScrollView, View } from 'react-native';
import SectionTitle from '../components/SectionTitle';
import HighlightCard from '../components/HighlightCard';
import PlanCard from '../components/PlanCard';
import TaskList from '../components/TaskList';
import ActionStrip from '../components/ActionStrip';
import { adminInsights, adminPlans, adminTasks } from '../data/mockData';
import { colors } from '../theme/colors';

export default function AdminScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionTitle title="Gestão do Estúdio" subtitle="Controla finanças e turmas" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
      >
        {adminInsights.map(item => (
          <HighlightCard key={item.id} {...item} />
        ))}
      </ScrollView>

      <ActionStrip
        actions={[
          { id: 'billing', label: 'Gerir mensalidades', icon: 'card', tint: colors.accent },
          { id: 'allocate', label: 'Mover alunos', icon: 'git-compare', tint: colors.highlight },
          { id: 'reports', label: 'Relatórios', icon: 'bar-chart', tint: colors.info }
        ]}
      />

      <SectionTitle title="Planos activos" subtitle="Equilíbrio de planos e membros" />
      {adminPlans.map(plan => (
        <PlanCard key={plan.id} {...plan} />
      ))}

      <SectionTitle title="Tarefas prioritárias" subtitle="Workflow idêntico à App Studio" />
      <TaskList tasks={adminTasks} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
