/* istanbul ignore file */
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from './button';

const meta = {
  title: 'Components/Card',
  component: Card,
};

export default meta;

export const Example = () => (
  <div className="bg-muted p-6">
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Subtitle or supporting copy goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-foreground">
          Cards help group related information. Use this area to highlight key
          details or nest form fields, lists, and summaries.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">
            Dismiss
          </Button>
          <Button size="sm">View details</Button>
        </div>
      </CardFooter>
    </Card>
  </div>
);
