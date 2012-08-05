#import "OldOrdersViewController.h"
#import "CurrentOrderDetailViewController.h"
#import "PictureUploadHandler.h"
#import "SubmitOrderViewController.h"

@implementation CurrentOrderDetailViewController
{
    NSManagedObjectContext *_managedObjectContext;
}

@synthesize isCurrentOrder = _isCurrentOrder;
@synthesize submitOrderButton;

- (void)viewDidLoad
{
    [super viewDidLoad];

    _isCurrentOrder = true;

    [OldOrdersViewController setCurrentOrderViewController:self];
    [PictureUploadHandler setCurrentOrderViewController:self];

    id appDelegate = (id)[[UIApplication sharedApplication] delegate];
    _managedObjectContext = [appDelegate managedObjectContext];

    self.submitOrderButton.target = self;
    self.submitOrderButton.action = @selector(onSubmitOrderButtonClicked);

    NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] init];
    NSEntityDescription *entity = [NSEntityDescription entityForName:@"Order" inManagedObjectContext:_managedObjectContext];
    [fetchRequest setEntity:entity];
    [fetchRequest setPredicate:[NSPredicate predicateWithFormat:@"submissionDate = ''"]];
    [fetchRequest setFetchBatchSize:1];

    NSError *error;
    NSArray *results = [_managedObjectContext executeFetchRequest:fetchRequest error:&error];

    if(error)
    {
        NSLog(@"Failed to retrieve current order: %@", [error localizedDescription]);
        return;
    }

    if([results count] > 0)
        [self ordersChanged:[results objectAtIndex:0]];
    else
        [self ordersChanged:nil];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if([[segue identifier] isEqualToString:@"showSubmitOrder"])
        [((SubmitOrderViewController*)[segue destinationViewController]) setOrder:self.order];
}

- (void)onSubmitOrderButtonClicked
{
    if([[self.order valueForKey:@"pictureIds"] length] > 1)
        [self performSegueWithIdentifier:@"showSubmitOrder" sender:self];
    else
        [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Info", @"")
                                    message:NSLocalizedString(@"NoPicturesInOrder", @"")
                                   delegate:nil
                          cancelButtonTitle:NSLocalizedString(@"DismissError", @"")
                          otherButtonTitles:nil] show];
}

- (void)ordersChanged:(NSManagedObject*)currentOrder
{
    NSLog(@"Orders changed");

    if(currentOrder == nil)
    {
        NSLog(@"no curr");
    }

    self.order = currentOrder;
}

- (void)uploadingPicturesChanged
{
    [self performSelectorOnMainThread:@selector(relayout) withObject:self waitUntilDone:false];
}

@end
