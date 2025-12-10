/* istanbul ignore file */
import { Button } from '../button/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
};

export default meta;

export const FiltersDrawer = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button>Open filters</Button>
    </SheetTrigger>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>
          Adjust list results without leaving the page.
        </SheetDescription>
      </SheetHeader>
      <div className="space-y-4 text-sm leading-6 text-foreground/90">
        <div className="space-y-2">
          <p className="font-medium text-foreground">Categories</p>
          <div className="space-x-2">
            <Button variant="secondary" size="sm">
              Design
            </Button>
            <Button variant="secondary" size="sm">
              Research
            </Button>
            <Button variant="secondary" size="sm">
              Engineering
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Sort</p>
          <div className="space-x-2">
            <Button variant="secondary" size="sm">
              Recent
            </Button>
            <Button variant="secondary" size="sm">
              Popular
            </Button>
            <Button variant="secondary" size="sm">
              Trending
            </Button>
          </div>
        </div>
      </div>
      <SheetFooter>
        <Button variant="secondary">Reset</Button>
        <Button>Apply</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);
