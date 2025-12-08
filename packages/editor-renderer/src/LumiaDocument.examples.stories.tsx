import type { Meta, StoryObj } from '@storybook/react';
import { LumiaDocument } from './components/LumiaDocument';
import { LumiaEditorStateJSON } from './types';
import marketingDoc from './fixtures/marketing-doc.json';
import knowledgeBase from './fixtures/knowledge-base.json';
import blogPost from './fixtures/blog-post.json';

const meta: Meta<typeof LumiaDocument> = {
  title: 'Renderer/Examples',
  component: LumiaDocument,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LumiaDocument>;

export const MarketingDoc: Story = {
  name: 'Marketing Document',
  args: {
    value: marketingDoc as unknown as LumiaEditorStateJSON,
  },
};

export const KnowledgeBase: Story = {
  name: 'Knowledge Base Article',
  args: {
    value: knowledgeBase as unknown as LumiaEditorStateJSON,
  },
};

export const BlogPost: Story = {
  name: 'Blog Post with Code',
  args: {
    value: blogPost as unknown as LumiaEditorStateJSON,
  },
};
