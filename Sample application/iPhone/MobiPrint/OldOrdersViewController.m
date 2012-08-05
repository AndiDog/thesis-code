#import "OldOrdersViewController.h"
#import "OrderDetailViewController.h"
#import "settings.h"
#import "YAJLiOS/YAJL.h"
#import "ISO8601DateFormatter.h"
#import "NSString+CountString.h"

static CurrentOrderDetailViewController *currentOrderViewController = nil;

@interface OldOrdersViewController ()
- (void)configureCell:(UITableViewCell *)cell atIndexPath:(NSIndexPath *)indexPath;
@end

@implementation OldOrdersViewController
{
    NSURLConnection *_connection;
    NSTimer *_updateTimer;
    NSMutableData *_webData;
}

@synthesize fetchedResultsController = __fetchedResultsController;
@synthesize managedObjectContext = __managedObjectContext;
@synthesize ordersCountLabel;

+ (void)setCurrentOrderViewController:(CurrentOrderDetailViewController*)controller
{
    currentOrderViewController = controller;
}

- (void)awakeFromNib
{
    [super awakeFromNib];
}

- (void)viewDidLoad
{
    id appDelegate = (id)[[UIApplication sharedApplication] delegate];
    self.managedObjectContext = [appDelegate managedObjectContext];

    [super viewDidLoad];

    [self controllerDidChangeContent:nil];

    [self updateOrders];
}

- (void)viewDidUnload
{
    [super viewDidUnload];

    _connection = nil;
    [_updateTimer invalidate];
    _updateTimer = nil;
    _webData = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

- (void)insertNewObject:(id)sender
{
    NSManagedObjectContext *context = [self.fetchedResultsController managedObjectContext];
    NSEntityDescription *entity = [[self.fetchedResultsController fetchRequest] entity];
    NSManagedObject *newManagedObject = [NSEntityDescription insertNewObjectForEntityForName:[entity name] inManagedObjectContext:context];

    // If appropriate, configure the new managed object.
    // Normally you should use accessor methods, but using KVC here avoids the need to add a custom class to the template.
    [newManagedObject setValue:[NSNumber numberWithInt:5] forKey:@"id"];

    // Save the context.
    NSError *error = nil;
    if (![context save:&error]) {
         // Replace this implementation with code to handle the error appropriately.
         // abort() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
        NSLog(@"Unresolved error %@, %@", error, [error userInfo]);
        abort();
    }
}

#pragma mark - Table View

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [self.fetchedResultsController.fetchedObjects count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"OrderCell"];
    [self configureCell:cell atIndexPath:indexPath];
    return cell;
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
    return NO;
}

- (BOOL)tableView:(UITableView *)tableView canMoveRowAtIndexPath:(NSIndexPath *)indexPath
{
    return NO;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if([[segue identifier] isEqualToString:@"showOrderDetail"])
    {
        NSIndexPath *indexPath = [self.tableView indexPathForSelectedRow];
        NSManagedObject *object = [[self fetchedResultsController] objectAtIndexPath:indexPath];
        [((OrderDetailViewController*)[segue destinationViewController]) setOrder:object];
    }
}

#pragma mark - Fetched results controller

- (NSFetchedResultsController *)fetchedResultsController
{
    if (__fetchedResultsController != nil) {
        return __fetchedResultsController;
    }

    NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] init];
    // Edit the entity name as appropriate.
    NSEntityDescription *entity = [NSEntityDescription entityForName:@"Order" inManagedObjectContext:self.managedObjectContext];
    [fetchRequest setEntity:entity];

    // Only old orders
    [fetchRequest setPredicate:[NSPredicate predicateWithFormat:@"submissionDate <> ''"]];

    // Set the batch size to a suitable number.
    [fetchRequest setFetchBatchSize:20];

    // Edit the sort key as appropriate.
    NSSortDescriptor *sortDescriptor = [[NSSortDescriptor alloc] initWithKey:@"submissionDate" ascending:YES];
    NSArray *sortDescriptors = [NSArray arrayWithObjects:sortDescriptor, nil];

    [fetchRequest setSortDescriptors:sortDescriptors];

    // Edit the section name key path and cache name if appropriate.
    // nil for section name key path means "no sections".
    NSFetchedResultsController *aFetchedResultsController = [[NSFetchedResultsController alloc] initWithFetchRequest:fetchRequest managedObjectContext:self.managedObjectContext sectionNameKeyPath:nil cacheName:nil];
    aFetchedResultsController.delegate = self;
    self.fetchedResultsController = aFetchedResultsController;

	NSError *error = nil;
	if (![self.fetchedResultsController performFetch:&error]) {
        // Replace this implementation with code to handle the error appropriately.
        // abort() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
	    NSLog(@"Unresolved error %@, %@", error, [error userInfo]);
	    abort();
	}

    return __fetchedResultsController;
}

- (void)controllerWillChangeContent:(NSFetchedResultsController *)controller
{
    [self.tableView beginUpdates];
}

- (void)controller:(NSFetchedResultsController *)controller didChangeSection:(id <NSFetchedResultsSectionInfo>)sectionInfo
           atIndex:(NSUInteger)sectionIndex forChangeType:(NSFetchedResultsChangeType)type
{
    switch(type) {
        case NSFetchedResultsChangeInsert:
            [self.tableView insertSections:[NSIndexSet indexSetWithIndex:sectionIndex] withRowAnimation:UITableViewRowAnimationFade];
            break;

        case NSFetchedResultsChangeDelete:
            [self.tableView deleteSections:[NSIndexSet indexSetWithIndex:sectionIndex] withRowAnimation:UITableViewRowAnimationFade];
            break;
    }
}

- (void)controller:(NSFetchedResultsController *)controller didChangeObject:(id)anObject
       atIndexPath:(NSIndexPath *)indexPath forChangeType:(NSFetchedResultsChangeType)type
      newIndexPath:(NSIndexPath *)newIndexPath
{
    UITableView *tableView = self.tableView;

    switch(type) {
        case NSFetchedResultsChangeInsert:
            [tableView insertRowsAtIndexPaths:[NSArray arrayWithObject:newIndexPath] withRowAnimation:UITableViewRowAnimationFade];
            break;

        case NSFetchedResultsChangeDelete:
            [tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath] withRowAnimation:UITableViewRowAnimationFade];
            break;

        case NSFetchedResultsChangeUpdate:
            [self configureCell:[tableView cellForRowAtIndexPath:indexPath] atIndexPath:indexPath];
            break;

        case NSFetchedResultsChangeMove:
            [tableView deleteRowsAtIndexPaths:[NSArray arrayWithObject:indexPath] withRowAnimation:UITableViewRowAnimationFade];
            [tableView insertRowsAtIndexPaths:[NSArray arrayWithObject:newIndexPath]withRowAnimation:UITableViewRowAnimationFade];
            break;
    }
}

- (void)controllerDidChangeContent:(NSFetchedResultsController *)controller
{
    [self.tableView endUpdates];

    int count = [[[self fetchedResultsController] fetchedObjects] count];
    [self.ordersCountLabel setText:[NSString stringWithFormat:NSLocalizedString(@"NumOrders", @""), count]];
}

/*
// Implementing the above methods to update the table view in response to individual changes may have performance implications if a large number of changes are made simultaneously. If this proves to be an issue, you can instead just implement controllerDidChangeContent: which notifies the delegate that all section and object changes have been processed.

- (void)controllerDidChangeContent:(NSFetchedResultsController *)controller
{
    // In the simplest, most efficient, case, reload the table view.
    //[self.tableView reloadData];
}*/

- (void)configureCell:(UITableViewCell *)cell atIndexPath:(NSIndexPath *)indexPath
{
    NSManagedObject *object = [self.fetchedResultsController objectAtIndexPath:indexPath];

    // Can be assumed to be in ISO 8601 format since we only show old orders
    NSString *submissionDate = [object valueForKey:@"submissionDate"];
    NSDate *date = [[[ISO8601DateFormatter alloc] init] dateFromString:submissionDate];

    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    [formatter setDateFormat:@"EEEE, MMMM d"];
    [formatter setLocale:[NSLocale currentLocale]];

    NSString *firstPart = [formatter stringFromDate:date];
    [formatter setDateFormat:@"yyyy"];
    NSString *secondPart = [formatter stringFromDate:date];

    NSString *dayPostfix = @"th";

    if([firstPart hasSuffix:@"1"])
        dayPostfix = @"st";
    else if([firstPart hasSuffix:@"2"])
        dayPostfix = @"nd";
    else if([firstPart hasSuffix:@"3"])
        dayPostfix = @"rd";

    UILabel *dateLabel = (UILabel*)[cell viewWithTag:1];
    UILabel *numPicsLabel = (UILabel*)[cell viewWithTag:2];
    int numPics = [((NSString*)[object valueForKey:@"pictureIds"]) countOccurencesOfString:@","];

    dateLabel.text = [NSString stringWithFormat:@"%@%@ %@", firstPart, dayPostfix, secondPart];
    numPicsLabel.text = [NSString stringWithFormat:NSLocalizedString(@"NumPicturesFmt", @""), numPics];
}

#pragma mark - Own methods

- (void)updateOrders
{
    NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@%@", WEB_SERVICE_BASE_URI, @"orders/"]]];
    _webData = [NSMutableData data];

    _connection = [[NSURLConnection alloc] initWithRequest:request delegate:self];

    NSLog(@"Request started");

    // Run in 60 second interval
    if(!_updateTimer)
        _updateTimer = [NSTimer scheduledTimerWithTimeInterval:60 target:self selector:@selector(updateOrders) userInfo:nil repeats:true];
}

-(void)showUpdateErrorWithDescription:(NSString*)description
{
    [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", @"")
                                message:[NSString stringWithFormat:@"%@: %@", NSLocalizedString(@"FailedToUpdateOrders", @""), description]
                               delegate:nil
                      cancelButtonTitle:NSLocalizedString(@"DismissError", @"")
                      otherButtonTitles:nil] show];
}

-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse*)response;
    [_webData setLength: 0];

    if([httpResponse statusCode] < 200 || [httpResponse statusCode] >= 300)
    {
        [self showUpdateErrorWithDescription:[NSString stringWithFormat:@"Status code %@", [httpResponse statusCode]]];

        return;
    }
}

-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [_webData appendData:data];
}

-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    NSLog(@"Failed to update old orders");

    [self showUpdateErrorWithDescription:@"Connection error"];
}

-(void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    _connection = nil;

    NSLog(@"Received orders");

    NSDictionary *json = [_webData yajl_JSON];

    if(!json)
    {
        NSLog(@"JSON could not be parsed");
        [self showUpdateErrorWithDescription:@"JSON parsing error"];
        return;
    }

    NSLog(@"Got list of orders");

    id appDelegate = (id)[[UIApplication sharedApplication] delegate];
    NSManagedObjectContext *managedObjectContext = [appDelegate managedObjectContext];
    NSEntityDescription *entityDescription = [NSEntityDescription entityForName:@"Order" inManagedObjectContext:managedObjectContext];

    NSError *error;
    NSFetchRequest *request = [[NSFetchRequest alloc] init];
    [request setEntity:entityDescription];
    NSArray *array = [managedObjectContext executeFetchRequest:request error:&error];
    if(array == nil)
    {
        NSLog(@"Failed to clear orders: %@", [error localizedDescription]);
        [self showUpdateErrorWithDescription:@"Failed to retrieve saved orders"];
        return;
    }

    for(NSManagedObject *persistedOrder in array)
        [managedObjectContext deleteObject:persistedOrder];

    if(![managedObjectContext save:&error])
    {
        NSLog(@"Failed to delete orders: %@", [error localizedDescription]);
        [self showUpdateErrorWithDescription:@"Failed to delete orders"];
    }

    NSManagedObject *currentOrder = nil;
    NSArray *ordersArray = [json valueForKey:@"orders"];
    for(NSDictionary *order in ordersArray)
    {
        NSManagedObject *newOrder;
        newOrder = [NSEntityDescription insertNewObjectForEntityForName:@"Order"
                                        inManagedObjectContext:managedObjectContext];
        [newOrder setValue:[NSNumber numberWithInt:[[order valueForKey:@"id"] intValue]] forKey:@"id"];

        NSString *pictureIds = @"";
        for(NSNumber *pictureId in [order valueForKey:@"pictureIds"])
            pictureIds = [NSString stringWithFormat:@"%@%d,", pictureIds, [pictureId intValue]];

        [newOrder setValue:pictureIds forKey:@"pictureIds"];

        if([order valueForKey:@"submissionDate"] == [NSNull null])
        {
            currentOrder = newOrder;

            [newOrder setValue:@"" forKey:@"submissionDate"];
            [newOrder setValue:0 forKey:@"storeId"];
        }
        else
        {
            [newOrder setValue:[order valueForKey:@"submissionDate"] forKey:@"submissionDate"];
            [newOrder setValue:[NSNumber numberWithInt:[[order valueForKey:@"storeId"] intValue]] forKey:@"storeId"];
        }

        if(![managedObjectContext save:&error])
        {
            NSLog(@"Failed to save new order: %@", [error localizedDescription]);
            [self showUpdateErrorWithDescription:[NSString stringWithFormat:@"Failed to save order: %@", [error localizedDescription]]];
            return;
        }
    }

    // Some workaround because I didn't get fetchedResultsController to update the list automatically (maybe because
    // I'm using different managed object contexts per thread?)
    [self.fetchedResultsController performFetch:&error];
    [self.tableView reloadData];
    [self controllerDidChangeContent:self.fetchedResultsController];

    [currentOrderViewController ordersChanged:currentOrder];
}

@end
